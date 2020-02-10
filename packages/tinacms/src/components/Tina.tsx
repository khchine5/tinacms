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

import * as React from 'react'
import { ModalProvider } from './modals/ModalProvider'
import styled, { ThemeProvider } from 'styled-components'
import { TinaReset, Theme, DefaultTheme, ThemeProps } from '@tinacms/styles'
import { Sidebar } from './sidebar/Sidebar'
import { SIDEBAR_WIDTH } from '../Globals'
import { TinaCMS, SidebarPosition } from '../tina-cms'
import { CMSContext, useSubscribable } from '../react-tinacms'

const merge = require('lodash.merge')

export interface TinaProps {
  cms: TinaCMS
  hidden?: boolean
  theme?: Theme
}

export const Tina: React.FC<TinaProps> = ({
  cms,
  children,
  hidden,
  theme: themeOverrides,
}) => {
  useSubscribable(cms.sidebar)
  const theme: ThemeProps['theme'] = React.useMemo(
    () => ({
      tinacms: merge(DefaultTheme, themeOverrides) as Theme,
    }),
    [DefaultTheme, themeOverrides]
  )

  return (
    <CMSContext.Provider value={cms}>
      <SiteWrapper open={cms.sidebar.isOpen} position={cms.sidebar.position}>
        {children}
      </SiteWrapper>
      {!hidden && (
        <ThemeProvider theme={theme}>
          <ModalProvider>
            <TinaReset>
              <Sidebar />
            </TinaReset>
          </ModalProvider>
        </ThemeProvider>
      )}
    </CMSContext.Provider>
  )
}

const SiteWrapper = styled.div<{ open: boolean; position: SidebarPosition }>`
  opacity: 1 !important;
  background-color: transparent !important;
  background-image: none !important;
  overflow: visible !important;
  position: absolute !important;
  top: 0 !important;
  right: 0 !important;
  height: 100% !important;
  width: ${props =>
    isFixed(props.position) && props.open
      ? 'calc(100% - ' + SIDEBAR_WIDTH + 'px)'
      : '100%'} !important;
  transition: all ${props => (props.open ? 150 : 200)}ms ease-out !important;
`

function isFixed(position: SidebarPosition): boolean {
  return position === 'fixed' || position === 'displace'
}
