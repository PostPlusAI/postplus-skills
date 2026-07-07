# Events And Local

Use for public Facebook events, local and community activations, offline growth
signals, workshops, meetups, launches, and competitor event monitoring.

## Align

Likely user needs:

- "Are there relevant local or community events?"
- "What event formats work in this niche?"
- "Who organizes these events?"
- "Is there offline demand we can partner with?"

Ask only if no event seed exists:

`What event topic, location, page, group, or event URL should I search first?`

## Run

| Evidence need | Collection key | First pass |
| --- | --- | --- |
| Events by topic/location or event URL | `facebook-events` | 1 topic+location query or event URL, up to `10` events |

Run events in parallel with a group or marketplace pass only when the user is
running a local growth scan. Keep each lane separate.

## Read Fields

Use the fields present in the result: event URL, name, description, date and
time, location and address, organizer, public response counts (interested,
going, responded), online/offline flag, status (past or canceled), ticket
info, and external links. Do not invent fields the result does not contain.

## Analyze

Extract:

- event theme and audience
- organizer leads
- timing and location pattern
- demand clue from public response counts
- partnership or sponsorship angle
- low-signal or stale events

## Output

Create `result.json` and `evidence.html`. Include event cards with date,
organizer, location, public response counts, links, and status.

Chat format:

- query or location and event count
- strongest local patterns
- organizer or partner leads
- gaps
- artifact paths

## Stop

Stop for private attendee lists, hidden guest data, organizer backend data,
ticketing account access, exact attendance, or private contact extraction.
