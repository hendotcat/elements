import React from "react"
import { Document, Body } from "../../"

export default function BodyOnly(): React.ReactElement {
  return (
    <Document lang="en-US" title="example" description="testing">
      <Body>
        <h1>one</h1>
        <p>two</p>
      </Body>
    </Document>
  )
}
