# PrimePartner Website

A static GovCon opportunity intelligence + teaming connector site with a lightweight Node server for form submissions.

## Run locally

1) Ensure Node.js is installed.
2) From the project root, run:

```bash
node server.js
```

3) Open `http://localhost:3000` in your browser.

> Note: If you open the HTML files directly (file://), intake forms will not submit. Use the server for form storage.

## Where to edit content

- Page copy and structure:
  - `index.html` (Home)
  - `how-it-works.html`
  - `services.html` (For SDVOSBs)
  - `for-primes.html`
  - `partner-network.html`
  - `pricing.html`
  - `resources.html`
  - `about.html`
  - `contact.html`
  - `legal.html`

- Global styles and components: `css/styles.css`
- Page interactions (scroll reveal, accordion, form submit): `js/main.js`
- Intake storage endpoint: `server.js`
- Intake submissions stored at: `data/intake.json`

## Disclaimers

Compliance and disclaimers are included in the footer of each page and expanded on `legal.html`. Update wording there if needed.

## Form submissions via Formspree

The contact, SDVOSB intake, and prime intake forms post to Formspree. If you need to change the endpoint, update it in:
- `contact.html`
- `services.html`
- `for-primes.html`
