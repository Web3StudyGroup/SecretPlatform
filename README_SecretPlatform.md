# SecretPlatform - 机密转账平台

SecretPlatform是一个基于Zama FHE（全同态加密）技术的机密转账平台，允许用户进行完全加密的cUSDT存储、转账和提取操作。

## 项目功能

1. **加密代币系统**: 使用cUSDT（Confidential USDT）作为平台代币，基于Zama FHE技术实现完全加密
2. **机密充值**: 用户可以将cUSDT充值到平台，余额完全加密
3. **机密提取**: 用户可以从平台提取任意数量的cUSDT，提取数量也是加密的
4. **机密转账**: 用户可以输入加密的地址和金额，创建机密转账记录
5. **机密领取**: 接收方可以通过encryptClaim功能领取发送给他们的资金

## 技术栈

- **合约框架**: Hardhat
- **加密技术**: Zama FHE (Fully Homomorphic Encryption)
- **代币标准**: 基于ConfidentialFungibleTokenERC20Wrapper的cUSDT
- **前端**: Next.js + React + TypeScript
- **包管理**: pnpm/npm

## 项目结构

```
SecretPlatform/
├── contracts/                 # 智能合约
│   ├── SecretPlatform.sol     # 主平台合约
│   ├── cUSDT.sol             # 机密USDT代币合约
│   ├── MockERC20.sol         # 测试用ERC20代币
│   └── FHECounter.sol        # 示例FHE合约
├── test/                     # 合约测试
│   ├── SecretPlatform.ts
│   └── cUSDT.ts
├── deploy/                   # 部署脚本
│   ├── 01_deploy_mock_usdt.ts
│   ├── 02_deploy_cusdt.ts
│   └── 03_deploy_secret_platform.ts
├── app/                      # 前端应用
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx      # 主页面
│   │       └── layout.tsx    # 布局组件
│   └── package.json
└── docs/                     # 文档
    ├── zama_llm.md          # Zama FHE合约开发指南
    └── zama_doc_relayer.md  # Zama Relayer SDK文档
```

## 安装和设置

### 1. 安装依赖

```bash
# 安装合约依赖
npm install
# 或使用pnpm
pnpm install
```

### 2. 编译合约

```bash
npm run compile
```

### 3. 运行测试

```bash
npm run test
```

### 4. 部署合约

#### 本地部署

```bash
# 启动本地Hardhat网络
npx hardhat node

# 在另一个终端部署合约
npm run deploy:localhost
```

#### Sepolia测试网部署

```bash
npm run deploy:sepolia
```

### 5. 运行前端

```bash
cd app
npm install
npm run dev
```

前端将在 http://localhost:3000 启动

## 合约说明

### cUSDT合约

机密USDT代币合约，继承自OpenZeppelin的ConfidentialFungibleTokenERC20Wrapper，提供以下功能：
- `wrap(address to, uint256 amount)`: 将USDT包装成cUSDT（来自基类）
- `unwrap(address from, address to, euint64 amount)`: 将cUSDT解包回USDT（来自基类）
- `confidentialTransfer(address to, euint64 amount)`: 机密转账（来自基类）
- `confidentialTransferFrom(address from, address to, euint64 amount)`: 代理机密转账（来自基类）
- `confidentialBalanceOf(address account)`: 查询加密余额（来自基类）
- `setOperator(address operator, uint48 until)`: 设置操作员权限（来自基类）
- `decimals()`: 返回6位小数（重写方法）

### SecretPlatform合约

主平台合约，提供以下功能：
- `deposit(externalEuint64 encryptedAmount, bytes inputProof)`: 充值cUSDT到平台
- `withdraw(externalEuint64 encryptedAmount, bytes inputProof)`: 从平台提取cUSDT
- `encryptedTransferTo(address recipient, externalEuint64 encryptedAmount, bytes inputProof)`: 创建机密转账
- `encryptClaim(address sender)`: 领取转账
- `getBalance(address user)`: 查询平台余额
- `getTransferRecord(address recipient, address sender)`: 查询转账记录

## 使用流程

### 1. 充值流程

1. 用户持有USDT代币
2. 调用cUSDT的`wrap()`将USDT包装成cUSDT
3. 调用SecretPlatform的`deposit()`将cUSDT充值到平台
4. 用户在平台上的余额被加密存储

### 2. 转账流程

1. 用户在平台上有余额
2. 调用`encryptedTransferTo()`指定接收方地址和加密金额
3. 转账记录被加密存储在合约中
4. 用户余额被扣除（加密状态）

### 3. 领取流程

1. 接收方知道有人向他们转账
2. 调用`encryptClaim()`指定发送方地址
3. 转账金额被添加到接收方的平台余额
4. 转账记录被清除

### 4. 提取流程

1. 用户在平台上有余额
2. 调用`withdraw()`指定提取的加密金额
3. 平台余额被扣除，cUSDT被转回用户钱包
4. 用户可选择调用cUSDT的`unwrap()`转回USDT

## 前端功能

前端提供直观的用户界面：
- **钱包连接**: 连接MetaMask等以太坊钱包
- **余额显示**: 显示用户在平台上的加密余额
- **充值界面**: 输入金额并充值到平台
- **提取界面**: 输入金额并从平台提取
- **转账界面**: 输入接收方地址和转账金额
- **领取界面**: 输入发送方地址并领取转账

## 安全特性

1. **完全加密**: 所有金额和余额都使用FHE加密，链上不暴露明文数据
2. **访问控制**: 使用FHE ACL系统确保只有授权用户可以访问加密数据
3. **隐私保护**: 转账金额和用户余额对外部观察者完全不可见
4. **零知识**: 即使是合约运行期间也不会泄露任何敏感信息

## 开发和测试

### 添加新功能

1. 在`contracts/`目录下修改或添加合约
2. 在`test/`目录下添加相应测试
3. 运行测试确保功能正常
4. 更新部署脚本（如需要）

### 调试

使用Hardhat console进行调试：

```bash
npx hardhat console --network localhost
```

### 测试网络

项目配置了Sepolia测试网络，确保在`.env`文件中设置：
- `SEPOLIA_RPC_URL`: Sepolia RPC端点
- `PRIVATE_KEY`: 部署账户私钥

## 注意事项

1. **Gas费用**: FHE操作比普通操作消耗更多Gas
2. **网络兼容**: 目前只支持配置了Zama FHE的网络
3. **密钥管理**: 妥善保管私钥，不要在生产环境中使用测试私钥
4. **异步解密**: 某些操作可能需要异步解密，请参考Zama文档

## 支持和文档

- [Zama FHEVM文档](https://docs.zama.ai/fhevm)
- [项目问题反馈](https://github.com/your-repo/issues)
- [开发指南](./docs/zama_llm.md)

## 许可证

本项目基于MIT许可证开源。