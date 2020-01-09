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

import { useCallback, useEffect, useState } from 'react'
import { useWatchFormValues, useForm, useCMS } from 'tinacms'

/**
 * A datastructure representing a JsonFile stored in Git
 */
export interface JsonFile<T = any> {
  fileRelativePath: string
  data: T
}

/**
 * Creates a TinaCMS Form for editing a JsonFile in Git
 */
export function useJsonForm<T = any>(jsonFile: JsonFile<T>) {
  const cms = useCMS()

  const [valuesInGit, setValuesInGit] = useState<JsonFile<T>>()

  useEffect(() => {
    cms.api.git
      .show(jsonFile.fileRelativePath) // Load the contents of this file at HEAD
      .then((git: { content: string }) => {
        const jsonFileInGit = JSON.parse(git.content)

        setValuesInGit(jsonFileInGit)
      })
      .catch((e: any) => {
        console.log('FAILED', e)
      })
  }, [jsonFile.fileRelativePath])

  const [values, form] = useForm(
    {
      id: jsonFile.fileRelativePath,
      label: jsonFile.fileRelativePath,
      initialValues: valuesInGit,
      onSubmit() {
        return cms.api.git.commit({
          files: [jsonFile.fileRelativePath],
          message: `Commit from Tina: Update ${jsonFile.fileRelativePath}`,
        })
      },
      fields: [{ name: 'title', label: 'Title', component: 'text' }],
    },
    { values: jsonFile.data }
  )

  const writeToDisk = useCallback(formState => {
    cms.api.git.writeToDisk({
      fileRelativePath: jsonFile.fileRelativePath,
      content: JSON.stringify({ title: formState.values.title }),
    })
  }, [])

  useWatchFormValues(form, writeToDisk)

  return [values || jsonFile.data, form]
}