import './scopeModuleMocks'
import {
  gfmMock as mockGfm,
  markdownMock as mockMarkdown,
  monacoMock as mockMonaco,
} from './scopeMocks'

jest.mock('react-markdown', () => mockMarkdown)
jest.mock('remark-gfm', () => mockGfm)
jest.mock('@monaco-editor/react', () => mockMonaco)
