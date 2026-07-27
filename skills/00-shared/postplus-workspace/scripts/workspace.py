#!/usr/bin/env python3
"""Initialize and validate PostPlus workspaces without overwriting user files."""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any


SKILL_DIR = Path(__file__).resolve().parent.parent
TEMPLATE_DIR = SKILL_DIR / "assets" / "project-template"
UNKNOWN_VALUES = {"", "unknown", "tbd", "todo", "pending"}
PROJECT_LINE = re.compile(
    r"^(?P<indent> *)(?P<key>[A-Za-z_][A-Za-z0-9_-]*):(?: *(?P<value>.*))?$"
)


def validate_target(raw_target: str) -> Path:
    target = Path(raw_target).expanduser().resolve()
    filesystem_root = Path(target.anchor).resolve()
    home = Path.home().resolve()

    if target in {filesystem_root, home}:
        raise ValueError(
            "Target must be a resolved project folder, not a filesystem root or user home."
        )
    if target == SKILL_DIR or SKILL_DIR in target.parents:
        raise ValueError("Target must not be inside an installed skill directory.")
    return target


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKC", value).strip().casefold()
    parts: list[str] = []
    separator_pending = False

    for character in normalized:
        if character.isalnum():
            if separator_pending and parts:
                parts.append("-")
            parts.append(character)
            separator_pending = False
        else:
            separator_pending = True

    slug = "".join(parts).strip("-")
    if not slug:
        raise ValueError("Name must contain at least one letter or digit.")
    return slug


def render(text: str, values: dict[str, str]) -> str:
    rendered = text
    for key, value in values.items():
        rendered = rendered.replace("{{" + key + "}}", value)
    return rendered


def relative_path(path: Path, target: Path) -> str:
    return path.relative_to(target).as_posix()


def write_from_template(
    source: Path,
    destination: Path,
    target: Path,
    values: dict[str, str],
    created: list[str],
    skipped: list[str],
) -> None:
    destination_name = relative_path(destination, target)
    if destination.exists():
        skipped.append(destination_name)
        return
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(
        render(source.read_text(encoding="utf-8"), values),
        encoding="utf-8",
    )
    created.append(destination_name)


def emit_json(payload: dict[str, Any], output_path: str | None) -> None:
    text = json.dumps(payload, ensure_ascii=False, indent=2)
    if output_path:
        destination = Path(output_path).expanduser().resolve()
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(text + "\n", encoding="utf-8")
    print(text)


def parse_project_scalar(raw_value: str, line_number: int) -> Any:
    value = raw_value.strip()
    if value == "":
        return ""
    if value.startswith('"'):
        try:
            return json.loads(value)
        except json.JSONDecodeError as error:
            raise ValueError(
                f"project.yaml line {line_number} has an invalid quoted value."
            ) from error
    if value.startswith("'"):
        if not value.endswith("'"):
            raise ValueError(
                f"project.yaml line {line_number} has an invalid quoted value."
            )
        return value[1:-1].replace("''", "'")
    if value in {"true", "false"}:
        return value == "true"
    if value == "null":
        return None
    if re.fullmatch(r"-?[0-9]+", value):
        return int(value)
    return value


def read_project_values(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}

    values: dict[str, Any] = {}
    stack: list[tuple[int, str]] = []

    for line_number, line in enumerate(
        path.read_text(encoding="utf-8").splitlines(),
        start=1,
    ):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if "\t" in line[: len(line) - len(line.lstrip())]:
            raise ValueError(
                f"project.yaml line {line_number} uses tabs; use spaces for indentation."
            )

        match = PROJECT_LINE.match(line)
        if not match:
            raise ValueError(
                f"project.yaml line {line_number} is outside the supported mapping schema."
            )

        indent = len(match.group("indent"))
        key = match.group("key")
        raw_value = match.group("value") or ""

        while stack and stack[-1][0] >= indent:
            stack.pop()

        path_parts = [entry[1] for entry in stack] + [key]
        dotted_key = ".".join(path_parts)

        if raw_value.strip() == "":
            stack.append((indent, key))
            continue

        if dotted_key in values:
            raise ValueError(f"project.yaml contains duplicate key `{dotted_key}`.")
        values[dotted_key] = parse_project_scalar(raw_value, line_number)

    return values


def project_value(values: dict[str, Any], key: str) -> str:
    value = values.get(key, "")
    return "" if value is None else str(value)


def markdown_value(path: Path, label: str) -> str:
    if not path.exists():
        return ""
    pattern = re.compile(rf"^\s*-\s*{re.escape(label)}:\s*(.*?)\s*$", re.IGNORECASE)
    for line in path.read_text(encoding="utf-8").splitlines():
        match = pattern.match(line)
        if match:
            return match.group(1).strip()
    return ""


def is_unknown(value: str) -> bool:
    normalized = value.strip().lower()
    return normalized in UNKNOWN_VALUES or normalized.startswith("unknown")


def require_file(path: Path, blockers: list[str]) -> None:
    if not path.exists():
        blockers.append(f"Missing required file: {path.name}")


def require_project(
    values: dict[str, Any],
    key: str,
    blockers: list[str],
) -> None:
    if is_unknown(project_value(values, key)):
        blockers.append(f"project.yaml: `{key}` is unresolved.")


def require_markdown(path: Path, label: str, blockers: list[str]) -> None:
    if is_unknown(markdown_value(path, label)):
        blockers.append(f"{path.name}: `{label}` is unresolved.")


def require_table_row(path: Path, row_id: str, blockers: list[str]) -> None:
    if not path.exists():
        return

    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip().startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if not cells or cells[0] != row_id:
            continue
        if any(is_unknown(cell) for cell in cells[1:]):
            blockers.append(f"{path.name}: `{row_id}` is unresolved.")
        return

    blockers.append(f"{path.name}: required row `{row_id}` is missing.")


def require_approval(
    values: dict[str, Any],
    approval: str,
    blockers: list[str],
    expected_campaign: str | None = None,
) -> None:
    prefix = f"approvals.{approval}"
    if project_value(values, f"{prefix}.status") != "approved":
        blockers.append(f"project.yaml: `{prefix}.status` must be approved.")
        return
    if (
        expected_campaign is not None
        and project_value(values, f"{prefix}.campaign") != expected_campaign
    ):
        blockers.append(
            f"project.yaml: `{prefix}.campaign` must match `{expected_campaign}`."
        )
    require_project(values, f"{prefix}.approved_by", blockers)
    require_project(values, f"{prefix}.approved_at", blockers)


def resolve_campaign(
    target: Path,
    values: dict[str, Any],
    requested: str | None,
) -> tuple[str, Path | None]:
    slug = requested or project_value(values, "current_campaign")
    if not slug:
        return "", None
    if slug != slugify(slug):
        raise ValueError("Campaign slug must already be normalized.")
    return slug, target / "campaigns" / slug


def init_workspace(args: argparse.Namespace) -> int:
    target = validate_target(args.target)
    target.mkdir(parents=True, exist_ok=True)
    values = {
        "PROJECT_NAME": args.project or target.name,
        "BRAND_NAME": args.brand or "UNKNOWN",
        "PRODUCT_NAME": args.product or "UNKNOWN",
        "MARKET": args.market or "UNKNOWN",
        "PLATFORM": args.platform or "UNKNOWN",
    }
    created: list[str] = []
    skipped: list[str] = []

    for name in (
        "AGENTS.md",
        "project.yaml",
        "brand.md",
        "product.md",
        "audience.md",
        "persona.md",
        "assets.md",
        "hooks.md",
    ):
        write_from_template(
            TEMPLATE_DIR / name,
            target / name,
            target,
            values,
            created,
            skipped,
        )

    for directory in ("source-materials", "campaigns", "outputs"):
        (target / directory).mkdir(exist_ok=True)

    emit_json(
        {
            "schemaVersion": 1,
            "operation": "workspace-init",
            "status": "initialized",
            "workspace": str(target),
            "created": created,
            "skippedExisting": skipped,
            "next": "Fill confirmed source material, then run the onboarding stage check.",
        },
        args.output,
    )
    return 0


def init_campaign(args: argparse.Namespace) -> int:
    target = validate_target(args.target)
    project_file = target / "project.yaml"
    if not project_file.exists():
        raise ValueError("project.yaml not found. Initialize the workspace first.")

    project_values = read_project_values(project_file)
    campaign_slug = args.slug or slugify(args.name)
    if campaign_slug != slugify(campaign_slug):
        raise ValueError("Campaign slug must already be normalized.")

    destination = target / "campaigns" / campaign_slug
    existing_campaign = destination / "campaign.md"
    expected_title = f"# Campaign: {args.name}"
    if existing_campaign.exists():
        existing_lines = existing_campaign.read_text(encoding="utf-8").splitlines()
        first_line = existing_lines[0] if existing_lines else ""
        if first_line != expected_title:
            raise ValueError(
                f"Campaign slug `{campaign_slug}` already belongs to a different name."
            )

    values = {
        "CAMPAIGN_NAME": args.name,
        "CAMPAIGN_SLUG": campaign_slug,
        "BRAND_NAME": project_value(project_values, "brand") or "UNKNOWN",
        "PRODUCT_NAME": project_value(project_values, "product") or "UNKNOWN",
        "MARKET": project_value(project_values, "default_market") or "UNKNOWN",
        "PLATFORM": project_value(project_values, "default_platform") or "UNKNOWN",
    }
    created: list[str] = []
    skipped: list[str] = []

    for source in sorted((TEMPLATE_DIR / "campaign-template").glob("*.md")):
        write_from_template(
            source,
            destination / source.name,
            target,
            values,
            created,
            skipped,
        )

    emit_json(
        {
            "schemaVersion": 1,
            "operation": "campaign-init",
            "status": "initialized",
            "campaign": campaign_slug,
            "campaignDirectory": relative_path(destination, target),
            "created": created,
            "skippedExisting": skipped,
            "next": (
                f'Set current_campaign to "{campaign_slug}" after confirming intent.'
            ),
        },
        args.output,
    )
    return 0


def check_workspace(args: argparse.Namespace) -> int:
    target = validate_target(args.target)
    stage = args.stage
    blockers: list[str] = []
    project_file = target / "project.yaml"

    for name in ("AGENTS.md", "project.yaml", "brand.md", "product.md", "assets.md"):
        require_file(target / name, blockers)

    project_values = read_project_values(project_file)
    if project_file.exists():
        for key in ("project_name", "brand", "product"):
            require_project(project_values, key, blockers)

    product_file = target / "product.md"
    for label in ("Category", "Description"):
        require_markdown(product_file, label, blockers)
    for key in ("default_market", "default_platform"):
        require_project(project_values, key, blockers)

    campaign_slug, campaign_dir = resolve_campaign(
        target,
        project_values,
        args.campaign,
    )
    campaign_stages = {"strategy", "test", "production", "launch", "learn"}

    if stage in campaign_stages:
        if campaign_dir is None:
            blockers.append(
                "No campaign selected. Pass --campaign or set current_campaign."
            )
        elif not campaign_dir.exists():
            blockers.append(
                f"Campaign directory does not exist: campaigns/{campaign_slug}"
            )

    if stage in {"strategy", "test", "production", "launch", "learn"}:
        audience_file = target / "audience.md"
        require_file(audience_file, blockers)
        for label in ("Segment name", "Trigger event", "Core pain or desire"):
            require_markdown(audience_file, label, blockers)

        if campaign_dir is not None:
            campaign_file = campaign_dir / "campaign.md"
            require_file(campaign_file, blockers)
            for label in ("Primary objective", "Primary KPI"):
                require_markdown(campaign_file, label, blockers)

    if stage in {"test", "production", "launch", "learn"} and campaign_dir:
        strategy_file = campaign_dir / "creative-strategy.md"
        test_file = campaign_dir / "test-plan.md"
        require_file(strategy_file, blockers)
        require_file(test_file, blockers)
        require_table_row(strategy_file, "H001", blockers)
        for label in (
            "Primary KPI",
            "Evidence threshold",
            "Winner rule",
            "Loser rule",
            "Inconclusive rule",
        ):
            require_markdown(test_file, label, blockers)
        require_table_row(test_file, "T001", blockers)

    if stage in {"production", "launch", "learn"} and campaign_dir:
        require_approval(project_values, "product_truth", blockers)
        require_approval(
            project_values,
            "test_plan",
            blockers,
            expected_campaign=campaign_slug,
        )

        brief_file = campaign_dir / "production-brief.md"
        require_file(brief_file, blockers)
        for label in (
            "Creative ID",
            "Hypothesis ID",
            "Test cell ID",
            "Changed variables",
            "Controlled variables",
            "Aspect ratio",
            "Resolution",
            "Audio generation",
            "Total duration",
        ):
            require_markdown(brief_file, label, blockers)

    if stage == "launch" and campaign_dir:
        campaign_file = campaign_dir / "campaign.md"
        brief_file = campaign_dir / "production-brief.md"
        for label in ("Offer", "CTA", "Destination", "Cost boundary"):
            require_markdown(campaign_file, label, blockers)
        for label in (
            "Product truth checked",
            "References resolved",
            "Provider or workflow validation",
        ):
            require_markdown(brief_file, label, blockers)

    if stage == "learn" and campaign_dir:
        results_file = campaign_dir / "results.md"
        require_file(results_file, blockers)
        for label in ("Supported conclusion", "Next hypothesis"):
            require_markdown(results_file, label, blockers)

    payload = {
        "schemaVersion": 1,
        "operation": "workspace-check",
        "scope": "workspace-files",
        "workspace": str(target),
        "stage": stage,
        "campaign": campaign_slug or None,
        "status": "BLOCKED" if blockers else "READY",
        "blockers": blockers,
    }
    emit_json(payload, args.output)
    return 2 if blockers else 0


def add_output_argument(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--output")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    init_parser = subparsers.add_parser("init", help="Initialize a workspace.")
    init_parser.add_argument("--target", required=True)
    init_parser.add_argument("--project")
    init_parser.add_argument("--brand")
    init_parser.add_argument("--product")
    init_parser.add_argument("--market")
    init_parser.add_argument("--platform")
    add_output_argument(init_parser)
    init_parser.set_defaults(func=init_workspace)

    campaign_parser = subparsers.add_parser(
        "new-campaign",
        help="Initialize a campaign.",
    )
    campaign_parser.add_argument("--target", required=True)
    campaign_parser.add_argument("--name", required=True)
    campaign_parser.add_argument("--slug")
    add_output_argument(campaign_parser)
    campaign_parser.set_defaults(func=init_campaign)

    check_parser = subparsers.add_parser(
        "check",
        help="Check local workspace readiness.",
    )
    check_parser.add_argument("--target", required=True)
    check_parser.add_argument(
        "--stage",
        required=True,
        choices=[
            "onboarding",
            "research",
            "strategy",
            "test",
            "production",
            "launch",
            "learn",
        ],
    )
    check_parser.add_argument("--campaign")
    add_output_argument(check_parser)
    check_parser.set_defaults(func=check_workspace)
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        return args.func(args)
    except (OSError, ValueError) as error:
        parser.error(str(error))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
