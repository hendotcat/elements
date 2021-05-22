import React from "react"
import ReactDOM from "react-dom/server"
import rehype from "rehype"
import format from "rehype-format"
import { name, version } from "./package.json"
import { Body, Document, Head, Heading } from "./elements"

function render(component: any): string {
  let html = ReactDOM.renderToString(component)
  const processor = rehype()
  processor.use(format)
  html = processor.processSync(html).toString()
  return html
}

describe(`${name}@${version}`, () => {
  describe("<Document />", () => {
    it("renders a valid document given the bare minimum input", () => {
      expect(render(
        <Document lang="en-US" title="test" />
      )).toMatchSnapshot()
    })

    it("renders custom header metadata", () => {
      expect(render(
        <Document lang="en-US" title="test">
          <Head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
          </Head>
        </Document>
      )).toMatchSnapshot()
    })

    it("treats bare children as body contents", () => {
      expect(render(
        <Document lang="en-US" title="test">
          <h1>title</h1>
        </Document>
      )).toMatchSnapshot()
    })

    it("renders <Body> children as body contents", () => {
      expect(render(
        <Document lang="en-US" title="test">
          <Body>
            <h1>title</h1>
          </Body>
        </Document>
      )).toMatchSnapshot()
    })
  })

  describe("<Heading />", () => {
    it("renders a <h1> by default", () => {
      expect(render(
        <Document lang="en-US" title="test">
          <Heading>title</Heading>
        </Document>
      )).toMatchSnapshot()
    })

    it("allows heading level changes of up to 1", () => {
      expect(render(
        <Document lang="en-US" title="test">
          <Heading level={1}>one</Heading>
          <Heading level={2}>two</Heading>
          <Heading level={3}>three</Heading>
          <Heading level={4}>four</Heading>
          <Heading level={5}>five</Heading>
          <Heading level={6}>six</Heading>
          <Heading level={5}>five</Heading>
          <Heading level={4}>four</Heading>
          <Heading level={3}>three</Heading>
          <Heading level={2}>two</Heading>
          <Heading level={1}>one</Heading>
        </Document>
      )).toMatchSnapshot()
    })

    it("rejects heading level changes of more than 1", () => {
      expect(() => render(
        <Document lang="en-US" title="test">
          <Heading level={1}>one</Heading>
          <Heading level={3}>three</Heading>
        </Document>
      )).toThrowErrorMatchingSnapshot()
    })
  })
})
