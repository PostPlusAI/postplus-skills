# Report Template

Use this exact top-level structure:

```markdown
# <Case> Shot-by-Shot Analysis

## Sources

| source | duration | source basis | notes |
| --- | ---: | --- | --- |

## Video 1: <source label>

### Beat 01 · <timecode> · <observable change>

- **Visual / setting:** <scene evidence>; **framing:** <shot size, angle,
  composition>; **lighting / color:** <observable treatment>
- **Motion / action:** camera=<movement>; subject=<movement>;
  product/props=<state and relationship>
- **Edit / sound:** <cut, speed, continuity, music, SFX, ambience>
- **Speech / text:** <actual wording or explicit absence>; capture=<status>
- **Emotional state:** <observable cue or inference>; confidence=<level>
- **Production purpose:** <inference tied to evidence>; confidence=<level>

<!-- Repeat the complete beat block through the end of the source. -->

## Video 2: <source label>

<!-- Repeat complete, isolated beat evidence for every source. -->

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
