import React from "react"
import { Document, Head, Body } from "../../"

export default function HeadAndBody(): React.ReactElement {
  return (
    <Document lang="en-US" title="example" description="testing">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <h1>one</h1>
        <p>two</p>
      </Body>
    </Document>
  )
}
