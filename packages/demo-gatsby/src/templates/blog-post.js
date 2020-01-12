/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import React, { useEffect } from "react"
import { Link, graphql } from "gatsby"

import styled from "styled-components"
import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"
import { liveRemarkForm, DeleteAction } from "gatsby-tinacms-remark"
import Img from "gatsby-image"
import { TinaField, Wysiwyg, Toggle, Select } from "tinacms"
import { BlogBlocks } from "../components/blog-blocks"
import { EditToggle } from "../components/edit-toggle"
import { PlainTextInput } from "../components/plain-text-input"

const get = require("lodash.get")

const PlainText = props => (
  <input style={{ background: "transparent " }} {...props.input} />
)
const MyToggle = props => <Toggle {...props} />
const MySelect = props => <Select {...props} />

function BlogPostTemplate(props) {
  const form = props.form
  const post = props.data.markdownRemark
  const siteTitle = props.data.site.siteMetadata.title
  const { previous, next } = props.pageContext
  const { isEditing, setIsEditing } = props
  const blocks = post.frontmatter.blocks || []

  return (
    <Layout location={props.location} title={siteTitle}>
      <EditToggle isEditing={isEditing} setIsEditing={setIsEditing} />
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />

      <div
        style={{
          backgroundColor: post.frontmatter.heading_color || "#ffffff",
        }}
      >
        <div
          style={{
            marginLeft: `auto`,
            marginRight: `auto`,
            maxWidth: rhythm(24),
            padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
          }}
        >
          <h1
            style={{
              margin: 0,
              marginTop: rhythm(2),
            }}
          >
            <TinaField name="rawFrontmatter.title" Component={PlainTextInput}>
              {post.frontmatter.title}{" "}
            </TinaField>
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: rhythm(2),
              marginBottom: rhythm(1),
            }}
          >
            <Bio />

            <div style={{ display: "flex", flexDirection: "column" }}>
              {post.frontmatter.thumbnail && (
                <Img
                  fluid={post.frontmatter.thumbnail.childImageSharp.fluid}
                  alt="Gatsby can't find me"
                />
              )}
              <span style={{ fontWeight: "600" }}>Date</span>
              <p>{post.frontmatter.date}</p>
            </div>

            <TinaField
              name="rawFrontmatter.draft"
              Component={MyToggle}
              type="checkbox"
            >
              {post.frontmatter.draft && (
                <small style={{ color: "fuchsia" }}>Draft</small>
              )}
            </TinaField>
          </div>
        </div>
      </div>

      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        <button onClick={() => setIsEditing(p => !p)}>
          {isEditing ? "Stop Editing" : "Start Editing"}
        </button>

        <TinaField
          name="rawFrontmatter.draft"
          Component={MyToggle}
          type="checkbox"
        >
          {post.frontmatter.draft && (
            <small style={{ color: "fuchsia" }}>Draft</small>
          )}
        </TinaField>
        <br />

        <TinaField
          name="rawFrontmatter.cool"
          Component={MySelect}
          options={[100, "Love this!", "How cool!"]}
        >
          <p>{post.frontmatter.cool}</p>
        </TinaField>
        <BlogBlocks form={form} data={blocks} />
        <TinaField name="rawMarkdownBody" Component={Wysiwyg}>
          <div
            dangerouslySetInnerHTML={{
              __html: props.data.markdownRemark.html,
            }}
          />
        </TinaField>
      </div>
      <div
        style={{
          marginBottom: rhythm(1),
          width: "100%",
          height: "1px",
          backgroundColor: "#eaeaea",
        }}
      />
      <ul
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(24),
          display: `flex`,
          flexWrap: `wrap`,
          justifyContent: `space-between`,
          listStyle: `none`,
          padding: 0,
        }}
      >
        <li>
          {previous && (
            <Link to={previous.fields.slug} rel="prev">
              ← {previous.frontmatter.title}
            </Link>
          )}
        </li>
        <li>
          {next && (
            <Link to={next.fields.slug} rel="next">
              {next.frontmatter.title} →
            </Link>
          )}
        </li>
      </ul>
    </Layout>
  )
}

/**
 * Blog Post Form
 */
const BlogPostForm = {
  actions: [DeleteAction],
  fields: [
    {
      label: "Gallery",
      name: "frontmatter.gallery",
      component: "group-list",
      defaultItem: {
        alt: "",
        src: "",
        photographer: {
          name: "",
          social: [],
        },
      },
      itemProps: item => ({
        key: item.src,
        label: item.alt,
      }),
      fields: [
        { name: "alt", component: "text" },
        { name: "src", component: "text" },
        {
          label: "Photographer",
          name: "photographer",
          component: "group",
          fields: [
            { name: "name", component: "text" },
            {
              name: "social",
              component: "group-list",
              fields: [
                { name: "platformName", component: "text" },
                { name: "account", component: "text" },
              ],
            },
          ],
        },
      ],
    },
    {
      label: "Fake Author",
      name: "frontmatter.fakeAuthor",
      component: "group",
      fields: [
        { name: "name", component: "text" },
        {
          name: "social",
          component: "group",
          fields: [
            { name: "twitter", component: "text" },
            { name: "facebook", component: "text" },
            { name: "instagram", component: "text" },
          ],
        },
      ],
    },
    {
      label: "Title",
      name: "frontmatter.title",
      component: "text",
      validate(value = "") {
        if (value.length < 5) {
          return `Please add ${5 - value.length} characters`
        }
        if (value.length > 100) {
          return `Please remove ${value.length - 100} characters`
        }
      },
    },
    {
      label: "Draft",
      name: "frontmatter.draft",
      component: "toggle",
    },
    {
      label: "New Shiny Select",
      name: "frontmatter.cool",
      component: "select",
      options: [100, "Love this!", "How cool!"],
    },
    {
      label: "Testing Number Component",
      name: "frontmatter.testNumber",
      component: "number",
      steps: 3,
    },
    {
      label: "Date",
      name: "frontmatter.date",
      component: "date",
    },
    {
      label: "Description",
      name: "frontmatter.description",
      component: "textarea",
    },
    {
      label: "Heading color",
      name: "frontmatter.heading_color",
      component: "color",
      colors: ["#ff0000", "#ffff00", "#00ff00", "#0000ff"],
      widget: "sketch",
    },
    {
      name: "frontmatter.thumbnail",
      label: "Thumbnail",
      component: "image",
      // Generate the frontmatter value based on the filename
      parse: filename => (filename ? `./${filename}` : null),

      // Decide the file upload directory for the post
      uploadDir: blogPost => {
        let postPathParts = blogPost.fileRelativePath.split("/")

        let postDirectory = postPathParts
          .splice(0, postPathParts.length - 1)
          .join("/")

        return "packages/demo-gatsby" + postDirectory
      },

      // Generate the src attribute for the preview image.
      previewSrc: (formValues, { input }) => {
        let path = input.name.replace("rawFrontmatter", "frontmatter")
        let gastbyImageNode = get(formValues, path)
        if (!gastbyImageNode) return ""
        return gastbyImageNode.childImageSharp.fluid.src
      },
    },
  ],
}

export default liveRemarkForm(BlogPostTemplate, BlogPostForm)

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      ...TinaRemark
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        blocks {
          _template
          text
          alt
          src
        }
        title
        date(formatString: "DD MMMM, YYYY")
        description
        heading_color
        draft
        cool
        thumbnail {
          childImageSharp {
            fluid {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
  }
`
