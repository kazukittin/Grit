# Grit - ダイエット記録アプリ V2

体重管理と習慣化をサポートするモダンなダイエット記録Webアプリケーション。

## 機能

### メイン機能
- 📊 **体重記録** - 日々の体重と体脂肪率を記録
- 🎯 **目標設定** - 目標体重を設定し、達成までの距離を可視化
- ✅ **習慣トラッキング** - カスタマイズ可能な日々のタスク管理
- 📈 **週間グラフ** - 体重推移を折れ線グラフで表示（目標ライン付き）
- 🟩 **継続カレンダー** - GitHubのようなヒートマップで継続状況を可視化
- 🏆 **レベルシステム** - 5日記録するごとにレベルアップ

### 技術スタック
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Backend**: Appwrite Cloud (認証 + データベース)
- **Routing**: React Router

## セットアップ

### 1. Appwriteプロジェクトの作成

1. [Appwrite Cloud](https://cloud.appwrite.io) でアカウントを作成
2. 新しいプロジェクトを作成
3. DatabasesでDatabaseを作成

### 2. Collectionsの作成

以下の4つのCollectionを作成してください：

#### profiles
| Attribute | Type | Required |
|-----------|------|----------|
| user_id | String (36) | Yes |
| target_weight | Float | No |
| target_calories | Integer | No |
| target_protein | Integer | No |
| target_fat | Integer | No |
| target_carbs | Integer | No |

#### weight_logs
| Attribute | Type | Required |
|-----------|------|----------|
| user_id | String (36) | Yes |
| weight | Float | Yes |
| fat_percentage | Float | No |
| date | String (10) | Yes |

#### habits
| Attribute | Type | Required |
|-----------|------|----------|
| user_id | String (36) | Yes |
| title | String (255) | Yes |
| is_active | Boolean | Yes (default: true) |

#### habit_logs
| Attribute | Type | Required |
|-----------|------|----------|
| user_id | String (36) | Yes |
| habit_id | String (36) | Yes |
| date | String (10) | Yes |
| completed | Boolean | Yes |

#### meal_logs
| Attribute | Type | Required |
|-----------|------|----------|
| user_id | String (36) | Yes |
| date | String (10) | Yes |
| meal_type | String (20) | Yes |
| food_name | String (255) | Yes |
| calories | Integer | No (default: 0) |
| protein | Float | No |
| fat | Float | No |
| carbs | Float | No |

### 3. インデックスの作成（推奨）

各Collectionに以下のインデックスを作成することを推奨します：

- **profiles**: `user_id` (key, unique)
- **weight_logs**: `user_id` + `date` (key, unique)
- **habits**: `user_id` (key)
- **habit_logs**: `user_id` + `habit_id` + `date` (key, unique)
- **meal_logs**: `user_id` + `date` (key)

### 4. パーミッションの設定

各Collectionのパーミッションを以下のように設定：
- **Any Role**: なし
- **Users Role**: Create, Read, Update, Delete

### 5. 環境変数の設定

```bash
cp .env.example .env
```

`.env` ファイルを編集し、Appwriteの認証情報を設定:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_PROFILES=profiles_collection_id
VITE_APPWRITE_COLLECTION_WEIGHT_LOGS=weight_logs_collection_id
VITE_APPWRITE_COLLECTION_HABITS=habits_collection_id
VITE_APPWRITE_COLLECTION_HABIT_LOGS=habit_logs_collection_id
```

### 6. 依存関係のインストール

```bash
npm install
```

### 7. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 にアクセス

## プロジェクト構造

```
src/
├── lib/
│   └── appwrite.ts          # Appwriteクライアント初期化
├── contexts/
│   └── AuthContext.tsx      # 認証コンテキスト
├── services/
│   └── api.ts               # Appwrite Databases API関数
├── pages/
│   ├── AuthPage.tsx         # 認証ページ
│   ├── DashboardPage.tsx    # ダッシュボード
│   └── SettingsPage.tsx     # 設定ページ
├── components/
│   ├── Header.tsx           # ヘッダー（設定ボタン付き）
│   ├── SummaryCard.tsx      # サマリー（目標表示付き）
│   ├── WeeklyChart.tsx      # グラフ（目標ライン付き）
│   ├── DailyHabits.tsx      # 日々のタスク
│   ├── ContributionHeatmap.tsx  # 継続カレンダー
│   ├── RecordModal.tsx      # 記録入力モーダル
│   └── FloatingButton.tsx   # FAB
├── types.ts                 # 型定義
└── App.tsx                  # メインアプリ（ルーティング）
```

## 画面構成

1. **認証画面** (`/auth`) - ログイン・サインアップ
2. **ダッシュボード** (`/`) - メイン画面
3. **設定** (`/settings`) - 目標体重・習慣タスクの管理

## セキュリティ

- 認証にはAppwrite Account APIを使用
- すべてのデータクエリは `user_id` でフィルタリング
- Collectionパーミッションで認証済みユーザーのみアクセス可能

## ライセンス

MIT
