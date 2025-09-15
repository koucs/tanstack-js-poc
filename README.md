# TanStack JS PoC (Vite + React + TypeScript)

最小構成の PoC。TanStack Router / React Query / React Table を使用。

## セットアップ

- 必要: Node.js 18 以上
- 依存関係のインストール:

```bash
npm install
```

## 開発サーバ起動

```bash
npm run dev
```

- ブラウザで http://localhost:5173 を開く
- 画面:
  - `/` Home
  - `/users` Users（JSONPlaceholder から取得し、name/email/company.name を表示。列はソート可）

## スクリプト

- `npm run dev` 開発サーバ
- `npm run build` ビルド
- `npm run preview` ローカルプレビュー
- `npm run test` テスト実行（Vitest + React Testing Library）
- `npm run lint` ESLint チェック
- `npm run format` Prettier 整形
- `npm run typecheck` 型チェック

## 技術メモ

- ルーティング: TanStack Router の code-based 構成（Vite プラグイン不要）。`src/router.tsx`
- データ取得: React Query（`src/shared/queryClient.ts` で `QueryClientProvider` を提供）。
  - React Query Devtools 有効化済み。
- Users テーブル: TanStack Table v8 でソート対応。
- テスト: `src/pages/Users.test.tsx` にローディング→成功のスモークテストを1件追加。
- 型: `src/types/user.ts` に `User` 型を定義し厳格に利用。

## sequenceDiagram
```mermaid
sequenceDiagram
autonumber
actor U as ユーザー
participant B as ブラウザ
participant M as main.tsx
participant Q as QueryClientProvider
participant R as RouterProvider/Router
participant L as RootLayout
participant Pg as Usersコンポーネント
participant API as JSONPlaceholder API
participant T as TanStack Table

U->>B: /users にアクセス
B->>M: index.html から /src/main.tsx を読み込み
M->>Q: QueryClient を生成して注入
M->>R: Router を生成して注入
M-->>B: ReactQueryDevtools を描画
R->>L: ルート解決して RootLayout を描画
L-->>B: TanStackRouterDevtools を描画
R->>Pg: /users にマッチして Users をマウント

Pg->>Pg: useQuery 初期化 (isLoading=true)
Pg->>API: fetchUsers() GET /users
API-->>Pg: 200 OK (User[] JSON)
Pg->>Pg: isLoading=false / data セット
Pg->>T: useReactTable(columns, data, sorting)
Pg-->>B: テーブルをレンダリング

opt 列ソート
U->>B: ヘッダークリック（例: Name）
B->>Pg: setSorting([asc/desc])
Pg->>T: getSortedRowModel() で並び替え
Pg-->>B: 並び替え結果を再レンダリング
end

alt 取得エラー
API-->>Pg: 4xx/5xx エラー
Pg-->>B: エラー表示 (role="alert")
end
```

## classDiagram

```mermaid
classDiagram
direction LR

class Main {
  +render(): ReactElement
}

class QueryClientProvider {
  +client: QueryClient
}

class QueryClient {
  %% Mermaidのクラス図では属性の型にオブジェクトリテラル({})は使えないため、
  %% 別クラス(DefaultOptions)として表現する
  +defaultOptions: DefaultOptions
}

class ReactQueryDevtools

class RouterProvider {
  +router: Router
}

class Router {
  +routeTree
  +resolve(path): Component
}

class RootRoute { +path: "/" }
class IndexRoute { +path: "/" }
class UsersRoute { +path: "/users" }

class RootLayout {
  +nav()
  +outlet()
}

class TanStackRouterDevtools

class Home

class Users {
  -columns: ColumnDef~User~[]
  -sorting: SortingState
  +fetchUsers(): Promise~User[]~
  +render(): JSX
}

class useQuery {
  +data: User[]
  +isLoading: boolean
  +isError: boolean
}

class useReactTable {
  +getCoreRowModel()
  +getSortedRowModel()
}

class ColumnDef
class SortingState

class User {
  +id: number
  +name: string
  +email: string
  %% company もオブジェクトリテラルを使わず別クラスへ
  +company: Company
}

class DefaultOptions {
  +retry: number
  +refetchOnWindowFocus: boolean
  +staleTime: number
}

class Company {
  +name: string
}

class JSONPlaceholderAPI {
  +GET /users: User[]
}

Main o-- QueryClientProvider
Main o-- RouterProvider
Main ..> ReactQueryDevtools
RouterProvider *-- Router
Router *-- RootRoute
RootRoute *-- IndexRoute
RootRoute *-- UsersRoute
Router ..> RootLayout
RootLayout ..> TanStackRouterDevtools
IndexRoute ..> Home
UsersRoute ..> Users
Users o-- useQuery
Users o-- useReactTable
useReactTable o-- ColumnDef
useReactTable o-- SortingState
useQuery ..> QueryClient
Users ..> JSONPlaceholderAPI : fetchUsers()
Users ..> User
QueryClient o-- DefaultOptions : defaultOptions
User o-- Company : company

```