# Quick start

## Initialize

Clone project

```bash
git clone https://github.com/homeslands/order.git
```

Install docker

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
## Build

## Preview your site
## Monitor
## Manual initialization

`Required` Install [MySQL](https://dev.mysql.com/downloads/workbench/)

`Required` Install `nvm (Node Package Manager)` and `Nodejs >= v18.17.0`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

```bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

```bash
source ~/.bashrc
```

```bash
nvm install v18.17.0
nvm use v18.17.0
```

### Install dependencies

Install Order Api

```bash
cd app/order-api
npm install
```

Install Frontend

```bash
cd app/order-ui
npm install
```

### Run your site

Start Order Api:

```bash
cd app/order-api
npm run dev
```

Start Order Ui:

```bash
cd app/order-ui
npm run dev
```

Start docify:

```bash
docsify serve docs -p 3001
```

### Preview your site

- You can preview your site in your browser on `http://localhost:5173`.
- You can preview your API in your browser on `http://localhost:8081/api/api-docs`.
- You can preview your docs in your browser on `http://localhost:3001/docs`.