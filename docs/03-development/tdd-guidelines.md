# TDD開発ガイドライン

**作成日**: 2025-06-18  
**最終更新**: 2025-06-18  
**対象**: タスク管理アプリケーション開発チーム  

---

## 🎯 TDD開発の基本方針

### TDDサイクル
```
📝 Red (テスト作成・失敗)
      ↓
🟢 Green (最小実装・テスト成功)
      ↓
🔧 Refactor (リファクタリング)
      ↓
    (繰り返し)
```

### 開発フロー
1. **ユーザーストーリー** → **受け入れ基準** → **利用シナリオ**
2. **テストケース設計** → **テスト実装** → **機能実装**
3. **リファクタリング** → **統合テスト** → **デプロイ**

---

## 📋 TDD実践手順

### Step 1: 要件の理解と整理

#### 1.1 ユーザーストーリーの確認
```markdown
## 対象機能: サイドバーナビゲーション (SIDEBAR-001-01)

**ユーザーストーリー**:
タスク管理ユーザーとして、サイドバーから異なる画面へ素早く移動したい

**受け入れ基準**:
- サイドバーが画面左側に250px幅で表示される
- 3つのナビゲーション項目が表示される
- クリックで正確にページ遷移する
```

#### 1.2 利用シナリオの確認
[利用シナリオドキュメント](../02-design/scenarios/sidebar-navigation.md)を参照し、具体的な操作フローを理解

### Step 2: テストケースの設計

#### 2.1 ユニットテストの設計
```typescript
// 例: Sidebarコンポーネントのテスト設計
describe('Sidebar Component', () => {
  // 1. レンダリングテスト
  it('should render sidebar with correct width', () => {
    // サイドバーが250px幅で表示されること
  });
  
  // 2. ナビゲーション項目テスト
  it('should display three navigation items', () => {
    // 3つのナビゲーション項目が表示されること
  });
  
  // 3. クリックイベントテスト
  it('should navigate to correct page on click', () => {
    // クリック時に正確にページ遷移すること
  });
});
```

#### 2.2 統合テストの設計
```typescript
// 例: ページ遷移の統合テスト
describe('Navigation Integration', () => {
  it('should update active state when page changes', () => {
    // ページ変更時にアクティブ状態が更新されること
  });
});
```

### Step 3: Red Phase（テスト作成・失敗確認）

#### 3.1 失敗するテストの作成
```typescript
// 1. 最初は実装されていないので必ず失敗する
test('Sidebar should render with 250px width', () => {
  render(<Sidebar />);
  const sidebar = screen.getByRole('navigation');
  expect(sidebar).toHaveStyle('width: 250px');
}); // ❌ 失敗（Sidebarコンポーネントが存在しない）
```

#### 3.2 テスト実行・失敗確認
```bash
npm test -- Sidebar.test.tsx
# ❌ Sidebar component not found
```

### Step 4: Green Phase（最小実装・テスト成功）

#### 4.1 最小限の実装
```typescript
// テストを通すための最小限の実装
const Sidebar: React.FC = () => {
  return (
    <nav role="navigation" style={{ width: '250px' }}>
      {/* 最小実装 */}
    </nav>
  );
};
```

#### 4.2 テスト成功確認
```bash
npm test -- Sidebar.test.tsx
# ✅ All tests passed
```

### Step 5: Refactor Phase（リファクタリング）

#### 5.1 コード品質の改善
```typescript
// CSS Modules や styled-components を使用
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPath }) => {
  return (
    <nav className={styles.sidebar} role="navigation">
      {navigationItems.map(item => (
        <NavigationItem
          key={item.path}
          {...item}
          isActive={currentPath === item.path}
        />
      ))}
    </nav>
  );
};
```

#### 5.2 テスト実行・成功確認
```bash
npm test
# ✅ All tests still pass after refactoring
```

---

## 🧪 テスト分類と戦略

### ユニットテスト（Unit Tests）

#### 対象
- 個別コンポーネント
- 関数・メソッド
- ビジネスロジック

#### ツール・フレームワーク
```json
{
  "testing": {
    "framework": "Jest",
    "testingLibrary": "@testing-library/react",
    "coverage": "jest --coverage",
    "mocking": "jest.mock()"
  }
}
```

#### 例：NavigationItemコンポーネント
```typescript
describe('NavigationItem', () => {
  const mockProps = {
    path: '/tasks',
    label: 'タスク管理',
    icon: 'assignment',
    isActive: false,
    onClick: jest.fn()
  };

  it('should render label correctly', () => {
    render(<NavigationItem {...mockProps} />);
    expect(screen.getByText('タスク管理')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    render(<NavigationItem {...mockProps} />);
    fireEvent.click(screen.getByText('タスク管理'));
    expect(mockProps.onClick).toHaveBeenCalledWith('/tasks');
  });

  it('should apply active styles when active', () => {
    render(<NavigationItem {...mockProps} isActive={true} />);
    const item = screen.getByRole('button');
    expect(item).toHaveClass('active');
  });
});
```

### 統合テスト（Integration Tests）

#### 対象
- コンポーネント間の連携
- React Router との統合
- API との統合

#### 例：サイドバーとルーティング
```typescript
describe('Sidebar Navigation Integration', () => {
  it('should navigate and update active state', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // 初期状態確認
    expect(screen.getByText('ダッシュボード')).toHaveClass('active');

    // タスク管理をクリック
    fireEvent.click(screen.getByText('タスク管理'));

    // URL変更とアクティブ状態更新を確認
    expect(window.location.pathname).toBe('/tasks');
    expect(screen.getByText('タスク管理')).toHaveClass('active');
    expect(screen.getByText('ダッシュボード')).not.toHaveClass('active');
  });
});
```

### E2Eテスト（End-to-End Tests）

#### 対象
- ユーザージャーニー全体
- ブラウザ間動作確認
- パフォーマンス測定

#### ツール
```json
{
  "e2e": {
    "framework": "Playwright",
    "browsers": ["chromium", "firefox", "webkit"],
    "devices": ["Desktop", "Mobile"]
  }
}
```

#### 例：サイドバーナビゲーション E2E
```typescript
test('sidebar navigation user journey', async ({ page }) => {
  await page.goto('/');

  // デスクトップでのテスト
  await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  await page.click('text=タスク管理');
  await expect(page).toHaveURL('/tasks');

  // モバイルサイズに変更
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('[data-testid="hamburger"]')).toBeVisible();
  
  // ハンバーガーメニューのテスト
  await page.click('[data-testid="hamburger"]');
  await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  await page.click('text=設定');
  await expect(page).toHaveURL('/settings');
});
```

---

## 📊 テストカバレッジ目標

### カバレッジ基準
```
📊 カバレッジ目標
├── ユニットテスト: > 80%
├── 統合テスト: > 70%
└── E2Eテスト: 主要フロー 100%
```

### 測定コマンド
```bash
# カバレッジ測定
npm run test:coverage

# レポート生成
npm run test:coverage:report

# カバレッジ閾値チェック
npm run test:coverage:check
```

---

## 🔧 テスト実行戦略

### 開発時
```bash
# ウォッチモードでのテスト実行
npm run test:watch

# 特定ファイルのテスト
npm test -- Sidebar.test.tsx

# 特定パターンのテスト
npm test -- --testNamePattern="navigation"
```

### CI/CD パイプライン
```yaml
# .github/workflows/test.yml
name: Test Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Unit Tests
        run: npm run test:ci
      
      - name: Integration Tests
        run: npm run test:integration
      
      - name: E2E Tests
        run: npm run test:e2e
      
      - name: Coverage Check
        run: npm run test:coverage:check
```

---

## 🎯 TDD実践のポイント

### ✅ Good Practices

#### 1. 小さなサイクルで進める
```
❌ 大きな機能を一度に実装
✅ 小さな機能を段階的に実装
```

#### 2. テストファーストを徹底
```
❌ 実装後にテストを書く
✅ テストを先に書いてから実装
```

#### 3. 明確な受け入れ基準
```
❌ 曖昧な要件でテストを書く
✅ 具体的な受け入れ基準からテストを作成
```

#### 4. リファクタリングを怠らない
```
❌ 動けばOKで品質を無視
✅ 継続的なコード品質改善
```

### 🚨 注意点・アンチパターン

#### 1. テストのためのテスト
```typescript
// ❌ 意味のないテスト
it('should have a div', () => {
  render(<Component />);
  expect(screen.getByRole('generic')).toBeInTheDocument();
});

// ✅ 意味のあるテスト
it('should display task count correctly', () => {
  render(<TaskCounter count={5} />);
  expect(screen.getByText('5 件のタスク')).toBeInTheDocument();
});
```

#### 2. 実装詳細のテスト
```typescript
// ❌ 実装詳細をテスト
it('should call useState with initial value', () => {
  const spy = jest.spyOn(React, 'useState');
  render(<Component />);
  expect(spy).toHaveBeenCalledWith(initialValue);
});

// ✅ ユーザーの観点からテスト
it('should display initial message on load', () => {
  render(<Component />);
  expect(screen.getByText('初期メッセージ')).toBeInTheDocument();
});
```

---

## 🛠 開発環境設定

### 必要パッケージ
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0",
    "@playwright/test": "^1.35.0"
  }
}
```

### Jest設定
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### TypeScript設定
```json
{
  "compilerOptions": {
    "types": ["jest", "@testing-library/jest-dom"]
  }
}
```

---

## 📚 学習リソース

### 公式ドキュメント
- [Jest](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright](https://playwright.dev/docs/intro)

### TDD参考書籍
- Test Driven Development: By Example (Kent Beck)
- Growing Object-Oriented Software, Guided by Tests

### 社内ドキュメント
- [コーディング規約](./coding-standards.md)
- [テスト戦略](./testing-strategy.md)

---

## 🔄 継続的改善

### 定期レビュー項目
- [ ] テストの実行時間は適切か
- [ ] カバレッジ目標を達成しているか
- [ ] テストの保守性は良好か
- [ ] 偽陽性・偽陰性のテストはないか

### 改善アクション
- 月次でのテスト品質レビュー
- 新しいテスト手法の導入検討
- チーム内でのベストプラクティス共有

---

**作成者**: Claude Code  
**レビュー者**: (未定)  
**承認者**: (未定)