// prismjs の言語定義はグローバルの Prism に登録するため、先に prism-react-renderer の Prism を置く。
import { Prism } from 'prism-react-renderer'
;(globalThis as { Prism?: unknown }).Prism = Prism
