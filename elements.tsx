import React from "react"

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements
 */
export type ElementLevel =
  | "block"
  | "inline"
  | "undefined"

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element
 */
export type ElementName = 
  | "a"
  | "body"
  | "dd"
  | "dl"
  | "dt"
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "head"
  | "html"
  | "link"
  | "main"
  | "meta"
  | "span"

export type ContentCategorizer = ({ props, ancestry }: {
  props: React.HTMLAttributes<HTMLElement>,
  ancestry: ElementName[],
}) => ContentCategory[]

/**
 * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories
 */
export type ContentCategory =
  | "embedded"
  | "flow"
  | "form-associated"
  | "heading"
  | "interactive"
  | "metadata"
  | "phrasing"
  | "sectioning"

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements
 */
export type HeadingLevel =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6

const ElementLevels: Partial<Record<ElementName, ElementLevel>> = {
  html: "undefined",
}

const ElementContentCategories: Partial<Record<
  ElementName,
  ContentCategorizer
>> = {
  html: () => [],
}

const AncestryContext = React.createContext<ElementName[]>([])
const HeadingLevelContext = React.createContext<React.MutableRefObject<HeadingLevel>>(undefined)
const LanguageContext = React.createContext<React.MutableRefObject<string>>(undefined)
const TitleContext = React.createContext("")
const DescriptionContext = React.createContext("")

const withAncestry = (Component, name: ElementName) => props => {
  const ancestry = React.useContext(AncestryContext)
  const { children, ...rest } = props
  
  const contentCategories = ElementContentCategories[name]({ props, ancestry })

  if (ancestry.includes("body") && !contentCategories.includes("flow")) {
    throw new Error("Cannot render non-flow content inside <body>")
  }

  if (ancestry.includes("head") && !contentCategories.includes("metadata")) {
    throw new Error("Cannot render flow content inside <head>")
  }

  if (children) {
    return (
      <Component {...rest}>
        <AncestryContext.Provider value={[...ancestry, name]}>
          {children}
        </AncestryContext.Provider>
      </Component>
    )
  }
  return <Component {...props} />
}

const withLanguage = Component => props => {
  const parentLanguage = React.useContext(LanguageContext)
  const { lang, children, ...rest } = props
  const langRef = React.useRef(lang)
  if (!lang || lang === parentLanguage.current) {
    return <Component {...rest} children={children} />
  } else if (children) {
    return (
      <Component {...rest} lang={lang}>
        <LanguageContext.Provider value={langRef}>
          {children}
        </LanguageContext.Provider>
      </Component>
    )
  } else {
    return <Component {...props} />
  }
}

const withElementLevel = (Component, level: ElementLevel) => props => {
  const ancestry = React.useContext(AncestryContext)
  const parentName = ancestry[ancestry.length - 1]
  const parentLevel = ElementLevels[parentName]

  if (parentLevel === "inline" && level === "block") {
    throw new Error("Block element not allowed as child of inline element")
  }

  return <Component {...props} />
}

function element<Props>({
  name,
  level = "undefined",
  contentCategories,
  component = props => React.createElement(name, props),
}: {
  name: ElementName,
  level?: ElementLevel,
  contentCategories: ContentCategorizer,
  component?: (props: Props) => React.ReactElement,
}): React.FC<Props> {
  ElementLevels[name] = level
  ElementContentCategories[name] = contentCategories

  component = withAncestry(component, name)
  component = withElementLevel(component, level)
  component = withLanguage(component)
  return component
}

export const Anchor = element<
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>({
  name: "a",
  level: "inline",
  contentCategories: () => [
    "flow",
    "phrasing",
  ],
})

export const Body = element<
  React.HTMLAttributes<HTMLBodyElement>
>({
  name: "body",
  level: "block",
  contentCategories: () => [],
})

export const CanonicalLink: React.FC<{
  href: string
}> = ({ href }) => <Link rel="canonical" href={href} />

export const DescriptionDetails = element<
  React.HTMLAttributes<HTMLElement>
>({
  name: "dd",
  level: "block",
  contentCategories: () => ["flow"],
})

export const DescriptionList = element<
  React.HTMLAttributes<HTMLElement> & {
    items?: [
      React.ReactNode | string,
      React.ReactNode | string,
    ][]
  }
>({
  name: "dl",
  level: "block",
  contentCategories: () => ["flow"],
  component: ({ items, children, ...dl }) => (
    <dl {...dl}>
      {items ? items.map((item, i) => (
        <React.Fragment key={i}>
          <DescriptionTerm>
            {item[0]}
          </DescriptionTerm>
          <DescriptionDetails>
            {item[1]}
          </DescriptionDetails>
        </React.Fragment>
      )) : children}
    </dl>
  )
})

export const DescriptionTerm = element<
  React.HTMLAttributes<HTMLElement>
>({
  name: "dt",
  level: "block",
  contentCategories: () => ["flow"],
})

export const Div = element<
  React.HTMLAttributes<HTMLDivElement>
>({
  name: "div",
  level: "block",
  contentCategories: () => ["flow"],
})

export const Document: React.FC<React.HTMLAttributes<HTMLHtmlElement> & {
  description: string
  lang: string
  title: string
}> = props => {
  const { title, description,  ...html } = props
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
  const elementLevelRef = React.useRef("block" as ElementLevel)
  const headingLevelRef = React.useRef(1 as HeadingLevel)
  const langRef = React.useRef(props.lang)
  return (
    <AncestryContext.Provider value={["html"]}>
    <HeadingLevelContext.Provider value={headingLevelRef}>
    <LanguageContext.Provider value={langRef}>
      <TitleContext.Provider value={title}>
      <DescriptionContext.Provider value={description}>
        <html {...html}>
          {emptyBody ? (
            <>
              <Head />
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
              <Head />
              {props.children}
            </>
          ) : (
            <>
              <Head />
              <Body>{props.children}</Body>
            </>
          )}
        </html>
      </DescriptionContext.Provider>
      </TitleContext.Provider>
    </LanguageContext.Provider>
    </HeadingLevelContext.Provider>
    </AncestryContext.Provider>
  )
}

export const H1 = element<
  React.HTMLAttributes<HTMLHeadingElement>
>({
  name: "h1",
  level: "block",
  contentCategories: () => ["flow", "heading"],
  component: props => <Heading {...props} level={1} />,
})

export const H2 = element<
  React.HTMLAttributes<HTMLHeadingElement>
>({
  name: "h2",
  level: "block",
  contentCategories: () => ["flow", "heading"],
  component: props => <Heading {...props} level={2} />,
})

export const H3 = element<
  React.HTMLAttributes<HTMLHeadingElement>
>({
  name: "h3",
  level: "block",
  contentCategories: () => ["flow", "heading"],
  component: props => <Heading {...props} level={3} />,
})

export const H4 = element<
  React.HTMLAttributes<HTMLHeadingElement>
>({
  name: "h4",
  level: "block",
  contentCategories: () => ["flow", "heading"],
  component: props => <Heading {...props} level={4} />,
})

export const H5 = element<
  React.HTMLAttributes<HTMLHeadingElement>
>({
  name: "h5",
  level: "block",
  contentCategories: () => ["flow", "heading"],
  component: props => <Heading {...props} level={5} />,
})

export const H6 = element<
  React.HTMLAttributes<HTMLHeadingElement>
>({
  name: "h6",
  level: "block",
  contentCategories: () => ["flow", "heading"],
  component: props => <Heading {...props} level={6} />,
})

export const Head = element<React.HTMLAttributes<HTMLHeadElement>>({
  name: "head",
  level: "undefined",
  contentCategories: () => [],
  component: props => {
    const title = React.useContext(TitleContext)
    return (
      <head {...props}>
        <MetaCharset />
        <MetaViewport />
        <MetaDescription />
        <title>{title}</title>
        {props.children}
      </head>
    )
  },
})

export const Heading: React.FC<React.HTMLAttributes<HTMLHeadingElement> & {
  level?: HeadingLevel
}> = withLanguage(props => {
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

export const Link = element<
  React.LinkHTMLAttributes<HTMLLinkElement>
>({
  name: "link",
  contentCategories: () => ["metadata"],
})

export const Main = element<
  React.HTMLAttributes<HTMLElement>
>({
  name: "main",
  level: "block",
  contentCategories: () => ["flow"],
})

export const Meta = element<
  React.MetaHTMLAttributes<HTMLMetaElement>
>({
  name: "meta",
  contentCategories: ({ props }) => props.itemProp
    ? ["flow", "metadata", "phrasing"]
    : ["metadata"],
})

export const MetaCharset: React.FC = () => (
  <Meta charSet="utf-8" />
)

export const MetaDescription: React.FC<{
  description?: string
}> = ({ description = React.useContext(DescriptionContext) }) => (
  <Meta
    name="description" 
    content={description}
  />
)

export const MetaViewport: React.FC<{
  initialScale?: number
  width?: number | "device-width"
}> = ({ initialScale = 1, width = "device-width" }) => (
  <Meta
    name="viewport" 
    content={`width=${width}, initial-scale=${initialScale}`}
  />
)

export const Span = element<
  React.HTMLAttributes<HTMLSpanElement>
>({
  name: "span",
  level: "inline",
  contentCategories: () => ["flow", "phrasing"],
})

export const StylesheetLink: React.FC<{
  href: string
}> = ({ href }) => <Link rel="stylesheet" href={href} />

export const Elements = {
  Anchor,
  Body,
  CanonicalLink,
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
  Div,
  Document,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
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
