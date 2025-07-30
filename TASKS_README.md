# SecretPlatform Tasks 使用指南

这个文档介绍如何使用Hardhat tasks来与SecretPlatform进行交互。

## 快速开始

### 1. 部署完整系统

```bash
# 部署所有合约（包括MockUSDT用于测试）
npx hardhat deploy-secret-platform

# 或者使用现有的USDT地址
npx hardhat deploy-secret-platform --usdt 0x1234...
```

### 2. 快速部署（用于开发测试）

```bash
# 快速部署所有合约并准备测试数据
npx hardhat quick-deploy
```

## 核心功能Tasks

### 包装USDT为cUSDT

```bash
# 包装100 USDT为cUSDT
npx hardhat wrap-usdt --cusdt 0x... --amount 100

# 包装到指定地址
npx hardhat wrap-usdt --cusdt 0x... --amount 100 --to 0x...
```

### 授权平台操作权限

```bash
# 授权SecretPlatform操作你的cUSDT（默认1年有效期）
npx hardhat approve-platform --platform 0x...

# 自定义有效期（秒）
npx hardhat approve-platform --platform 0x... --duration 3600
```

### 充值到平台

```bash
# 充值50 cUSDT到平台
npx hardhat deposit --platform 0x... --amount 50
```

### 创建机密转账

```bash
# 向另一个地址发送机密转账
npx hardhat secret-transfer --platform 0x... --to 0x... --amount 25
```

### 领取转账

```bash
# 领取某人发送给你的转账
npx hardhat claim --platform 0x... --from 0x...
```

### 从平台提取

```bash
# 从平台提取30 cUSDT
npx hardhat withdraw --platform 0x... --amount 30
```

### 查看平台余额

```bash
# 查看你的平台余额（加密句柄）
npx hardhat balance --platform 0x...

# 查看其他用户的余额
npx hardhat balance --platform 0x... --user 0x...
```

## 实用工具Tasks

### 查看合约信息

```bash
# 查看合约的基本信息
npx hardhat info --address 0x...
```

### 设置测试环境

```bash
# 为两个用户设置完整的测试环境
npx hardhat setup-test --usdt 0x... --cusdt 0x... --platform 0x...
```

### 查看所有余额

```bash
# 查看用户在所有合约中的余额
npx hardhat balances --user 0x... --usdt 0x... --cusdt 0x... --platform 0x...
```

## 完整演示

### 运行完整演示

```bash
# 运行包含2个用户的完整演示
npx hardhat demo

# 自定义用户数量
npx hardhat demo --users 3
```

演示将会：
1. 部署所有合约
2. 为用户设置USDT和cUSDT
3. 授权平台操作权限
4. 执行充值、转账、领取等操作

## 使用流程示例

以下是一个完整的使用流程：

```bash
# 1. 部署系统
npx hardhat deploy-secret-platform
# 输出: USDT: 0xAAA, cUSDT: 0xBBB, Platform: 0xCCC

# 2. 包装USDT为cUSDT
npx hardhat wrap-usdt --cusdt 0xBBB --amount 500

# 3. 授权平台
npx hardhat approve-platform --platform 0xCCC

# 4. 充值到平台
npx hardhat deposit --platform 0xCCC --amount 200

# 5. 查看余额
npx hardhat balance --platform 0xCCC

# 6. 创建机密转账
npx hardhat secret-transfer --platform 0xCCC --to 0xDDD --amount 50

# 7. 接收方领取转账（使用接收方账户）
npx hardhat claim --platform 0xCCC --from <你的地址>

# 8. 提取资金
npx hardhat withdraw --platform 0xCCC --amount 100
```

## 注意事项

### 网络配置

确保在正确的网络上运行tasks：

```bash
# 本地网络
npx hardhat <task-name> --network localhost

# Sepolia测试网
npx hardhat <task-name> --network sepolia
```

### 账户管理

Tasks使用Hardhat配置中的第一个账户作为默认签名者。确保：

1. 账户有足够的ETH支付gas费用
2. 账户有足够的USDT进行操作
3. 正确设置了操作权限

### 加密数据

- 平台上的余额和转账金额都是加密的
- Tasks只显示加密句柄，不显示实际金额
- 要查看实际金额需要使用用户解密功能

### 错误处理

常见错误及解决方案：

1. **"Unauthorized access"**: 需要先授权平台操作权限
2. **"Transfer failed"**: 检查cUSDT余额和权限
3. **"No transfer record found"**: 确认转账已创建且地址正确

## 开发者说明

这些tasks位于`tasks/`目录下：

- `SecretPlatform.ts`: 主要功能tasks
- `quick-tasks.ts`: 开发和测试用的快速tasks

要添加新的task，在相应文件中使用Hardhat的task API创建即可。