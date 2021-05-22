import React from "react"
import ReactDOM from "react-dom/server"
import rehype from "rehype"
import format from "rehype-format"
import { name, version } from "./package.json"
import { Body, Document, Head } from "./elements"

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
      expect(render(<Document lang="en-US" title="test" />))
        .toMatchSnapshot()
    })

    it("renders custom header metadata", () => {
      expect(
        render(
          <Document lang="en-US" title="test">
            <Head>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              />
            </Head>
          </Document>
        )
      ).toMatchSnapshot()
    })

    it("treats bare children as body contents", () => {
      expect(
        render(
          <Document lang="en-US" title="test">
            <h1>title</h1>
          </Document>
        )
      ).toMatchSnapshot()
    })

    it("renders <Body> children as body contents", () => {
      expect(
        render(
          <Document lang="en-US" title="test">
            <Body>
              <h1>title</h1>
            </Body>
          </Document>
        )
      ).toMatchSnapshot()
    })
  })
})
