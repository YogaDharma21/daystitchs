import test from "node:test"
import assert from "node:assert/strict"
import React from "react"
import { renderToString } from "react-dom/server"
import { Snackbar } from "./.test-dist/snackbar.js"

test("Snackbar renders message and action when open", () => {
  const html = renderToString(
    React.createElement(Snackbar, {
      open: true,
      message: "Event deleted",
      actionLabel: "Undo",
    })
  )

  assert.ok(html.includes("Event deleted"), "Must render message")
  assert.ok(html.includes("Undo"), "Must render action button")
  assert.ok(html.includes('role="status"'), "Must have status role for accessibility")
})

test("Snackbar renders nothing when open is false", () => {
  const html = renderToString(
    React.createElement(Snackbar, {
      open: false,
      message: "Event deleted",
      actionLabel: "Undo",
    })
  )

  assert.equal(html, "")
})
