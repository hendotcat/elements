import React from "react"

/**
 * Denotes the directionality of an element's text
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir
 */
type Directionality = "auto" | "ltr" | "rtl"

/**
 * Denotes the language of an element's text
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang
 */
type Language = string

/**
 * Global attributes are attributes common to all HTML elements
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
 */
export interface GlobalAttributes {
  className: string
  dir: Directionality
  lang: Language
}

export interface Children<Type = React.ReactElement> {
  children?: Type
}

export type HeadProps = Partial<GlobalAttributes>
  & Children<React.ReactNode>

export type BodyProps = Partial<GlobalAttributes>
  & Children<React.ReactNode>

/**
 * The <html> tag requires a "lang" property for accessibility reasons.
 *
 * **WCAG Success Criterion 3.1.1: Language of Page (Level A)**
 * > The default human language of each Web page can be programmatically
 * > determined.
 *
 * https://www.w3.org/TR/WCAG21/#language-of-page
 */
export type DocumentRequirements = "lang"

export type DocumentProps = Partial<GlobalAttributes>
  & Required<Pick<GlobalAttributes, DocumentRequirements>>
  & { title: string }
  & Children<React.ReactNode[] | [
    React.ReactElement<HeadProps>,
    React.ReactElement<BodyProps>,
  ] | React.ReactElement<BodyProps>>

const LanguageContext = React.createContext("")
const TitleContext = React.createContext("")

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

const HeadingLevelContext = React.createContext<React.MutableRefObject<HeadingLevel>>(undefined)

function HeadingLevelProvider({ children }): React.ReactElement {
  const level = React.useRef(1 as HeadingLevel)
  return (
    <HeadingLevelContext.Provider value={level}>
      {children}
    </HeadingLevelContext.Provider>
  )
}

export type HeadingProps = Partial<GlobalAttributes> & {
  children: React.ReactNode
  level: HeadingLevel
}

export function Heading(props: HeadingProps): React.ReactElement {
  const headingLevel = React.useContext(HeadingLevelContext)
  const { level, ...heading } = props
  const levelChange = Math.abs(level - headingLevel.current)
  if (levelChange > 1) {
    throw new Error(
      `Heading level ${level} not allowed: previous level is ${headingLevel.current}`
    )
  }
  headingLevel.current = level
  const element = `h${level}`
  return React.createElement(element, heading)
}

export function Document(props: DocumentProps): React.ReactElement {
  const { title, ...html } = props
  const children: any = props.children
  const headAndBody = children.length === 2
    && children[0].type === Head
    && children[1].type === Body 
  const bodyOnly = !headAndBody
    && children.type === Body
  return (
    <HeadingLevelProvider>
    <LanguageContext.Provider value={props.lang}>
      <TitleContext.Provider value={title}>
        <html {...html}>
          {headAndBody ? (
            <>{children}</>
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
    </LanguageContext.Provider>
    </HeadingLevelProvider>
  )
}

export function Head(props: HeadProps): React.ReactElement {
  const title = React.useContext(TitleContext)
  return (
    <head {...props}>
      <meta charSet="utf-8" />
      <title>{ title }</title>
      {props.children}
    </head>
  )
}

export function Body(props: BodyProps): React.ReactElement {
  return <body {...props} />
}
