import React from "react"
import { Document, Heading } from "../../elements"

export default function Levels(): React.ReactElement {
  return (
    <Document lang="en-US" title="example">
      <Heading level={1}>level 1</Heading>
      <Heading level={2}>level 2</Heading>
      <Heading level={3}>level 3</Heading>
      <Heading level={4}>level 4</Heading>
      <Heading level={5}>level 5</Heading>
      <Heading level={6}>level 6</Heading>
    </Document>
  )
}
