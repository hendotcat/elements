import { select } from "hast-util-select"
import React from "react"
import ReactDOMServer from "react-dom/server"
import rehype from "rehype"
import rehypeDomParse from "rehype-dom-parse"
import rehypeFormat from "rehype-format"
import unified from "unified"
import { name, version } from "./package.json"
import {
  Body,
  Div,
  Document,
  H1,
  Head,
  Heading,
  Span,
} from "./elements"

function render(component: any): string {
  return rehype()
    .use(rehypeFormat)
    .processSync(ReactDOMServer.renderToString(component))
    .toString()
}

function parse(html: string): any {
  return unified()
    .use(rehypeDomParse, { fragment: false })
    .parse(html)
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

  describe("<H1 />", () => {
    it("renders a <h1>", () => {
      expect(render(
        <Document lang="en-US" title="test">
          <H1>title</H1>
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

  describe("<LanguageProvider />", () => {
    it("includes lang attribute if different from document", () => {
      const html = render(
        <Document lang="en-US" title="test">
          <Heading lang="sv-SE">titel</Heading>
        </Document>
      )
      const tree = parse(html)
      expect(select("html[lang='en-US']", tree)).toBeTruthy()
      expect(select("h1[lang='sv-SE']", tree)).toBeTruthy()
    })

    it("excludes lang attribute if same as document", () => {
      const html = render(
        <Document lang="en-US" title="test">
          <Heading lang="en-US">title</Heading>
        </Document>
      )
      const tree = parse(html)
      expect(select("html[lang='en-US']", tree)).toBeTruthy()
      expect(select("h1:not([lang='en-US'])", tree)).toBeTruthy()
    })

    it("includes lang attribute if different from parent", async () => {
      const html = render(
        <Document lang="en-US" title="test">
          <Heading lang="sv-SE">
            <Span lang="en-US">
              title
            </Span>
          </Heading>
        </Document>,
      )
      const tree = parse(html)
      expect(select("html[lang='en-US']", tree)).toBeTruthy()
      expect(select("h1[lang='sv-SE']", tree)).toBeTruthy()
      expect(select("span[lang='en-US']", tree)).toBeTruthy()
    })
  })

  describe("<LevelProvider />", () => {
    it("allows inline elements inside block elements", () => {
      expect(() => render(
        <Document lang="en-US" title="test">
          <Div><Span>test</Span></Div>
        </Document>
      )).not.toThrowError()
    })

    it("disallows block elements inside inline elements", () => {
      expect(() => render(
        <Document lang="en-US" title="test">
          <Span><Div>test</Div></Span>
        </Document>
      )).toThrowError()
    })
  })
})
