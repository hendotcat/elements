import React from "react"
import { Document } from "../../"

export default function ImplicitBody(): React.ReactElement {
  return (
    <Document lang="en-US" title="example" description="testing">
      <h1>one</h1>
      <p>two</p>
    </Document>
  )
}
