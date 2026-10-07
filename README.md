# Calm Weather — Interactive Prototype
Jason King and Finn Parker · CS 491

## Run locally
1. Extract the entire ZIP into a folder.
2. Open `index.html` in Chrome, Firefox, Safari, or Edge.
3. Keep `index.html`, `styles.css`, and `app.js` together.

No installation, internet connection, API key, or web server is needed.

## How this follows our storyboard
- Main page: View Timeline and Add Activity buttons.
- Activity picker: walking, running, hiking, or commuting.
- Duration: date, start time, and duration in minutes.
- Location: type a location, review an illustrative map, and confirm.
- Recommendations: weather advice for the selected activity and time.
- Timeline: scheduled activities with a menu to edit or delete each one, an Add Activity button, and a forecast link.
- Forecast: detailed weather metrics and conditions throughout the day, with a link back to the timeline.

The original screen flow and controls come from the submitted storyboard. The desktop layout, colors, wording, and date/start-time inputs are implementation details to review against your intended design before submission.

## What works
Add activities through all three steps; go back to change your choices; cancel; view recommendations; edit or delete activities; switch between the home page, timeline, and forecast. The app starts with two sample activities. Changes are saved in this browser when local storage is available. If it is blocked, changes still work for the current page session.

## Sample data and limitations
This is a usability prototype, not a live weather service. Weather is a fixed sample day in Albuquerque, used for every selected date and location. The location field labels your plan; it does not query a forecast or move the map. The map is illustrative and does not provide real navigation or geolocation.

Recommendations consider the forecast intervals covered by the activity, not just its start time. For example, a two-hour hike at 2 PM reaches the rainy 3 PM interval, triggering rain-layer advice. Commuting in rain also suggests leaving early. Cool temperatures suggest a jacket, high UV suggests sun protection, and running/hiking suggest water.

## Understanding the source
- `index.html`: shared page structure, navigation, and links to the CSS and JavaScript.
- `styles.css`: colors, typography, cards, forms, timeline, and responsive layout.
- `app.js`: activity records, sample weather, screen navigation, forms, and recommendations.

In `app.js`:
- `TYPES` contains the four activity choices.
- `WEATHER` contains the fixed sample forecast. Change these values to test different conditions.
- `render()` displays the appropriate storyboard screen, using the URL fragment (for example, `#timeline`).
- `startPlan()` creates a new draft or loads an activity for editing.
- `weatherFor()` checks weather throughout an activity's duration.
- `tipsFor()` applies simple weather rules to make recommendations.
- The `click` and `submit` handlers connect buttons and forms to those functions.
- `persist()` saves changes locally; `esc()` makes user-entered text safe to display.

The HTML file loads JavaScript with `defer`, so the page structure exists before the code runs. There are no imported JavaScript libraries or remote fonts.

## Suggested usability tasks
1. Add a 120-minute hike starting at 2 PM in the Sandia foothills. Find the recommendations.
2. Edit that hike into a morning run. Notice the advice change.
3. Find the afternoon rain chance in the forecast, then return to the timeline.
4. Delete an activity. Cancel deletion once to test both outcomes.

## Submission
Submit this folder's HTML, CSS, and JavaScript source files, or the ZIP if your instructor accepts ZIP submissions. A live website is optional; none is needed to run this prototype. These static files can also be hosted on GitHub Pages without modification.
