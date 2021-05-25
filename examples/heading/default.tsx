import React from "react"
import { Document, Heading } from "../../elements"

export default function DefaultLevel(): React.ReactElement {
  return (
    <Document lang="en-US" title="example" description="testing">
      <Heading>level 1</Heading>
      <Heading level={2}>level 2</Heading>
      <Heading>another level 2</Heading>
    </Document>
  )
}
