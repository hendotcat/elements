import { select } from "hast-util-select"
import React from "react"
import ReactDOMServer from "react-dom/server"
import rehype from "rehype"
import rehypeDomParse from "rehype-dom-parse"
import rehypeFormat from "rehype-format"
import unified from "unified"
import { name } from "./package.json"
import {
  Anchor,
  Body,
  CanonicalLink,
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
  Div,
  Document,
  H1,
  Head,
  Heading,
  Link,
  Main,
  Meta,
  MetaCharset,
  MetaDescription,
  MetaViewport,
  Span,
  StylesheetLink,
} from "./elements"

function render(component: any): string {
  return rehype()
    .use(rehypeFormat)
    .processSync(
      ReactDOMServer
        .renderToString(component)
        .replace(/ data-reactroot=""/g, "")
    )
    .toString()
}

function parse(html: string): any {
  return unified()
    .use(rehypeDomParse, { fragment: false })
    .parse(html)
}

describe(name, () => {
  describe("<Anchor />", () => {
    it("renders a link", async () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
          <Anchor href="https://example.org/">
            click here
          </Anchor>
        </Document>
      )
      const tree = parse(html)
      const tag = select("a[href='https://example.org/']", tree)
      expect(tag.children[0].value).toBe("click here")
    })

    it("cannot render inside <head>", async () => {
      expect(() => render(
        <Document lang="en-US" title="test" description="testing">
          <Head>
            <Anchor href="https://example.org/">
              click here
            </Anchor>
          </Head>
        </Document>
      )).toThrowError()
    })
  })

  describe("<CanonicalLink />", () => {
    it("sets the canonical URL", async () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
          <Head>
            <CanonicalLink href="https://example.org" />
          </Head>
        </Document>
      )
      const tree = parse(html)
      const tag = select("link[rel=canonical]", tree)
      expect(tag.properties.href).toBe("https://example.org")
    })
  })

  describe("<DescriptionDetails />", () => {
    it("renders a <dd> tag", async () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
          <Body>
            <DescriptionDetails>abc</DescriptionDetails>
          </Body>
        </Document>
      )
      const tree = parse(html)
      const tag = select("dd", tree)
      expect(tag.children[0].value).toBe("abc")
    })
  })

  describe("<DescriptionList />", () => {
    it("renders a <dl> tag", async () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
          <DescriptionList>abc</DescriptionList>
        </Document>
      )
      const tree = parse(html)
      const tag = select("dl", tree)
      expect(tag.children[0].value).toBe("abc")
    })

    it("renders a list of links with descriptions", async () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
          <DescriptionList items={[[
            <Anchor href="https://example.org/">link</Anchor>,
            <Span>an example website</Span>,
          ]]} />
        </Document>
      )
      expect(html).toMatchSnapshot()
    })
  })

  describe("<DescriptionTerm />", () => {
    it("renders a <dt> tag", async () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
          <DescriptionTerm>abc</DescriptionTerm>
        </Document>
      )
      const tree = parse(html)
      const tag = select("dt", tree)
      expect(tag.children[0].value).toBe("abc")
    })
  })

  describe("<Div />", () => {
    it("renders a <div> tag", async () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
          <Div />
        </Document>
      )
      const tree = parse(html)
      const tag = select("div", tree)
      expect(tag).toBeTruthy()
    })
  })

  describe("<Document />", () => {
    it("renders a valid document given the bare minimum input", () => {
      expect(render(
        <Document
          lang="en-US"
          title="test"
          description="testing"
        />
      )).toMatchSnapshot()
    })

    it("renders custom header metadata", () => {
      expect(render(
        <Document lang="en-US" title="test" description="testing">
          <Head>
            <meta property="og:title" content="test" />
          </Head>
        </Document>
      )).toMatchSnapshot()
    })

    it("treats bare children as body contents", () => {
      expect(render(
        <Document lang="en-US" title="test" description="testing">
          <h1>title</h1>
        </Document>
      )).toMatchSnapshot()
    })

    it("renders <Body> children as body contents", () => {
      expect(render(
        <Document lang="en-US" title="test" description="testing">
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
        <Document lang="en-US" title="test" description="testing">
          <H1>title</H1>
        </Document>
      )).toMatchSnapshot()
    })
  })

  describe("<Heading />", () => {
    it("renders a <h1> by default", () => {
      expect(render(
        <Document lang="en-US" title="test" description="testing">
          <Heading>title</Heading>
        </Document>
      )).toMatchSnapshot()
    })

    it("allows heading level changes of up to 1", () => {
      expect(render(
        <Document lang="en-US" title="test" description="testing">
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
        <Document lang="en-US" title="test" description="testing">
          <Heading level={1}>one</Heading>
          <Heading level={3}>three</Heading>
        </Document>
      )).toThrowErrorMatchingSnapshot()
    })
  })

  describe("<LanguageProvider />", () => {
    it("includes lang attribute if different from document", () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
          <Heading lang="sv-SE">titel</Heading>
        </Document>
      )
      const tree = parse(html)
      expect(select("html[lang='en-US']", tree)).toBeTruthy()
      expect(select("h1[lang='sv-SE']", tree)).toBeTruthy()
    })

    it("excludes lang attribute if same as document", () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
          <Heading lang="en-US">title</Heading>
        </Document>
      )
      const tree = parse(html)
      expect(select("html[lang='en-US']", tree)).toBeTruthy()
      expect(select("h1:not([lang='en-US'])", tree)).toBeTruthy()
    })

    it("includes lang attribute if different from parent", async () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
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

  describe("withElementLevel()", () => {
    it("allows inline elements inside block elements", () => {
      expect(() => render(
        <Document lang="en-US" title="test" description="testing">
          <Div><Span>test</Span></Div>
        </Document>
      )).not.toThrowError()
    })

    it("disallows block elements inside inline elements", () => {
      expect(() => render(
        <Document lang="en-US" title="test" description="testing">
          <Span><Div>test</Div></Span>
        </Document>
      )).toThrowError()
    })
  })

  describe("<Link />", () => {
    it("renders a <link> tag", async () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
          <Head>
            <Link rel="stylesheet" href="style.css" />
          </Head>
        </Document>
      )
      const tree = parse(html)
      const tag = select("link[rel='stylesheet'][href='style.css']", tree)
      expect(tag).toBeTruthy()
    })

    it("cannot render inside <body>", async () => {
      expect(() => render(
        <Document lang="en-US" title="test" description="testing">
          <Body>
            <Link rel="stylesheet" href="style.css" />
          </Body>
        </Document>
      )).toThrowError()
    })
  })

  describe("<Main />", () => {
    it("renders a <div> tag", async () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
          <Main />
        </Document>
      )
      const tree = parse(html)
      const tag = select("main", tree)
      expect(tag).toBeTruthy()
    })
  })

  describe("<Meta />", () => {
    it("renders a <meta> tag", async () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
          <Head>
            <Meta name="og:title" content="hello" />
          </Head>
        </Document>
      )
      const tree = parse(html)
      const tag = select("meta[name='og:title']", tree)
      expect(tag.properties.content).toBe("hello")
    })

    it("cannot be rendered inside <body>", async () => {
      expect(() => render(
        <Document lang="en-US" title="test" description="testing">
          <Body>
            <Meta name="og:title" content="hello" />
          </Body>
        </Document>
      )).toThrowError()
    })

    it("can render inside <body> when itemProp is present", async () => {
      expect(() => render(
        <Document lang="en-US" title="test" description="testing">
          <Body>
            <Meta itemProp="name" content="The Castle" />
          </Body>
        </Document>
      )).not.toThrowError()
    })
  })

  describe("<MetaCharset />", () => {
    it("sets the charset to utf8", async () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
          <Head>
            <MetaCharset />
          </Head>
        </Document>
      )
      const tree = parse(html)
      const tag = select("meta[charset='utf-8']", tree)
      expect(tag).toBeTruthy()
    })
  })

  describe("<MetaDescription />", () => {
    it("renders the SEO description", async () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing" />
      )
      const tree = parse(html)
      const tag = select("meta[name='description']", tree)
      expect(tag.properties.content).toBe("testing")
    })
  })

  describe("<MetaViewport />", () => {
    it("sets the usual responsive defaults", async () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
          <Head>
            <MetaViewport />
          </Head>
        </Document>
      )
      const tree = parse(html)
      const tag = select("meta[name='viewport']", tree)
      expect(tag.properties.content).toBe("width=device-width, initial-scale=1")
    })
  })

  describe("<Span />", () => {
    it("renders a <span> tag", async () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
          <Span />
        </Document>
      )
      const tree = parse(html)
      const tag = select("span", tree)
      expect(tag).toBeTruthy()
    })
  })

  describe("<StylesheetLink />", () => {
    it("links to a stylesheet", async () => {
      const html = render(
        <Document lang="en-US" title="test" description="testing">
          <Head>
            <StylesheetLink href="style.css" />
          </Head>
        </Document>
      )
      const tree = parse(html)
      const tag = select("link[rel=stylesheet]", tree)
      expect(tag.properties.href).toBe("style.css")
    })
  })
})
