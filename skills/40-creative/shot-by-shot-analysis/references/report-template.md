# Report Template

Use this exact top-level structure:

```markdown
# <Case> Shot-by-Shot Analysis

## Sources

| source | duration | source basis | notes |
| --- | ---: | --- | --- |

## Video 1: <source label>

| timecode | visual | framing/composition | camera motion | subject/action | product/prop relationship | lighting/color | edit rhythm | sound/music | speech/text | emotional state | production purpose |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Video 2: <source label>

<!-- Repeat the complete table for every source. -->

## Style Grammar Report

### 1. core_human_state
**Shared rule:**
**Evidence:**
**Recurrence:**
**Confidence:**

<!-- Repeat for all required dimensions. -->

## Downstream Handoff

### Image Generation
### Video Prompt Architecture
### Workflow Creation
```

The Style Grammar Report must contain these dimensions in order:

1. `core_human_state`
2. `camera_language`
3. `framing_rules`
4. `movement_rules`
5. `edit_rhythm`
6. `lighting_and_color`
7. `sound_world`
8. `speech_and_tone`
9. `text_and_subtitle_behavior`
10. `product_or_prop_behavior`
11. `proof_style`
12. `scene_world`
13. `must_keep`
14. `can_vary`
15. `avoid`
16. `generator_risks`
