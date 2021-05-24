import React from "react"

export type ElementName = 
  | "body"
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "head"
  | "html"
  | "span"

const ElementLevels: Record<ElementName, ElementLevel> = {
  body: "block",
  div: "block",
  h1: "block",
  h2: "block",
  h3: "block",
  h4: "block",
  h5: "block",
  h6: "block",
  head: "block",
  html: "block",
  span: "inline",
}

/*
export type ElementName = "a"
  | "abbr"
  | "address"
  | "area"
  | "article"
  | "aside"
  | "audio"
  | "b"
  | "base"
  | "bdi"
  | "bdo"
  | "blockquote"
  | "body"
  | "br"
  | "button"
  | "canvas"
  | "caption"
  | "cite"
  | "code"
  | "col"
  | "colgroup"
  | "data"
  | "datalist"
  | "dd"
  | "del"
  | "details"
  | "dfn"
  | "dialog"
  | "div"
  | "dl"
  | "dt"
  | "em"
  | "embed"
  | "fieldset"
  | "figcaption"
  | "figure"
  | "footer"
  | "form"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "head"
  | "header"
  | "hgroup"
  | "hr"
  | "html"
  | "i"
  | "iframe"
  | "img"
  | "input"
  | "ins"
  | "kbd"
  | "label"
  | "legend"
  | "li"
  | "link"
  | "main"
  | "map"
  | "mark"
  | "menu"
  | "meta"
  | "meter"
  | "nav"
  | "noscript"
  | "object"
  | "ol"
  | "optgroup"
  | "option"
  | "output"
  | "p"
  | "param"
  | "picture"
  | "pre"
  | "progress"
  | "q"
  | "rb"
  | "rp"
  | "rt"
  | "rtc"
  | "ruby"
  | "s"
  | "samp"
  | "script"
  | "section"
  | "select"
  | "slot"
  | "small"
  | "source"
  | "span"
  | "strong"
  | "style"
  | "sub"
  | "summary"
  | "sup"
  | "table"
  | "tbody"
  | "td"
  | "template"
  | "tfoot"
  | "th"
  | "thead"
  | "time"
  | "title"
  | "tr"
  | "track"
  | "u"
  | "ul"
  | "var"
  | "video"
  | "wbr"
*/

export type ElementLevel = "block" | "inline"

export type HeadProps = React.HTMLAttributes<HTMLHeadElement>

export type BodyProps = React.HTMLAttributes<HTMLBodyElement>

export type DivProps = React.HTMLAttributes<HTMLDivElement>
export type SpanProps = React.HTMLAttributes<HTMLSpanElement>

/**
 * The <html> tag requires a "lang" property for accessibility reasons.
 *
 * **WCAG Success Criterion 3.1.1: Language of Page (Level A)**
 * > The default human language of each Web page can be programmatically
 * > determined.
 *
 * https://www.w3.org/TR/WCAG21/#language-of-page
 */
export type DocumentRequirements = "lang" | "title"

export type DocumentProps = React.HTMLAttributes<HTMLHtmlElement>
  & Required<Pick<HTMLHtmlElement, DocumentRequirements>>

const LanguageContext = React.createContext<React.MutableRefObject<string>>(undefined)
const TitleContext = React.createContext("")

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

const ElementLevelContext = React.createContext<React.MutableRefObject<ElementLevel>>(undefined)
const HeadingLevelContext = React.createContext<React.MutableRefObject<HeadingLevel>>(undefined)

function HeadingLevelProvider({ children }): React.ReactElement {
  const level = React.useRef(1 as HeadingLevel)
  return (
    <HeadingLevelContext.Provider value={level}>
      {children}
    </HeadingLevelContext.Provider>
  )
}

function LanguageProvider({ children, lang }): React.ReactElement {
  const langRef = React.useRef(lang)
  return (
    <LanguageContext.Provider value={langRef}>
      {children}
    </LanguageContext.Provider>
  )
}

const withLanguage = Component => props => {
  const parentLanguage = React.useContext(LanguageContext)
  const { lang, children, ...rest } = props
  if (!lang || lang === parentLanguage.current) {
    return <Component {...rest} children={children} />
  } else if (children) {
    return (
      <Component {...rest} lang={lang}>
        <LanguageProvider lang={lang}>
          {children}
        </LanguageProvider>
      </Component>
    )
  } else {
    return <Component {...props} />
  }
}

function ElementLevelProvider({ children, elementLevel = "block" }): React.ReactElement {
  const ref = React.useRef(elementLevel as ElementLevel)
  return (
    <ElementLevelContext.Provider value={ref}>
      {children}
    </ElementLevelContext.Provider>
  )
}

const withElementLevel = (Component, level: ElementLevel) => props => {
  const parentLevel = React.useContext(ElementLevelContext)
  const { children, ...rest } = props
  if (parentLevel.current === "block" && level === "inline") {
    return (
      <Component {...rest}>
        <ElementLevelProvider elementLevel={level}>
          {children}
        </ElementLevelProvider>
      </Component>
    )
  }

  if (parentLevel.current === "inline" && level === "block") {
    throw new Error("Block element not allowed as child of inline element")
  }

  return <Component {...props} />
}

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  level?: HeadingLevel
}

export const Heading: React.FC<HeadingProps> = withLanguage(props => {
  const headingLevel = React.useContext(HeadingLevelContext)

  const {
    level: newLevel,
    ...heading
  } = props

  const level = newLevel || headingLevel.current
  const levelChange = Math.abs(level - headingLevel.current)
  if (levelChange > 1) {
    throw new Error(
      `Heading level ${level} not allowed: previous level is ${headingLevel.current}`
    )
  }

  headingLevel.current = level
  const Element = `h${level}`
  return <Element {...heading} />
})

export const Document: React.FC<DocumentProps> = props => {
  const { title, ...html } = props
  const children: any = props.children
  const emptyBody = children === undefined
  const headAndBody = !emptyBody
    && children.length === 2
    && children[0].type === Head
    && children[1].type === Body 
  const headOnly = !headAndBody
    && children?.type === Head
  const bodyOnly = !headAndBody
    && children?.type === Body
  return (
    <ElementLevelProvider>
    <HeadingLevelProvider>
    <LanguageProvider lang={props.lang}>
      <TitleContext.Provider value={title}>
        <html {...html}>
          {emptyBody ? (
            <>
              <Head></Head>
              <Body>{" "}</Body>
            </>
          ) : headAndBody ? (
            <>{children}</>
          ) : headOnly ? (
            <>
              {props.children}
              <Body>{" "}</Body>
            </>
          ) : bodyOnly ? (
            <>
              <Head></Head>
              {props.children}
            </>
          ) : (
            <>
              <Head></Head>
              <Body>{props.children}</Body>
            </>
          )}
        </html>
      </TitleContext.Provider>
    </LanguageProvider>
    </HeadingLevelProvider>
    </ElementLevelProvider>
  )
}

export const Head: React.FC<HeadProps> = props => {
  const title = React.useContext(TitleContext)
  return (
    <head {...props}>
      <meta charSet="utf-8" />
      <title>{ title }</title>
      {props.children}
    </head>
  )
}

function element<Props>(Element: ElementName): React.FC<Props> {
  let fc: React.FC<Props> = props => {
    return <Element {...props} />
  }
  fc = withElementLevel(fc, ElementLevels[Element])
  fc = withLanguage(fc)
  return fc
}

export const Body = element<React.HTMLAttributes<HTMLBodyElement>>("body")
export const Div = element<React.HTMLAttributes<HTMLDivElement>>("div")
export const Span = element<React.HTMLAttributes<HTMLSpanElement>>("span")
