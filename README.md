# Price Calculator Next

新一代云产品价格计算平台骨架项目。

## 目录

```text
price-calculator-next/
├── frontend/   # Vue 3 + TypeScript + Vite
├── backend/    # FastAPI
└── infra/      # Docker / Nginx / 部署占位
```

## 启动说明

当前目录只提供工程骨架和示例代码，不包含依赖安装结果。

前端：

```bash
cd frontend
npm install
npm run dev
```

后端：

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

运行后端测试：

```bash
cd backend
python3 -m unittest discover -s tests -v
```

## 下一步建议

1. 先完成登录、产品目录、报价工作台首页
2. 接入一个计算类产品作为迁移样板
3. 建立数据库和报价记录表
4. 建立前后端测试与 CI
