# frenchbench-api
FrenchBench API

## Install

```
npm install
```

## Configure

Copy and edit `.env.sample`

## Build

```
npm run build
```

## Run

Development mode, run code in `src`:

```
npm run start:dev
```

Production mode, run built code in `dist`:

```
npm run start
```

## Test

Run test cases in `tests` using Mocha and Chai.

```
npm run test
```

## Database

```
# upgrade production/live
npm run db:upgrade

#npm run db:upgrade:staging

#npm run db:upgrade:dev

# downgrade production/live
npm run db:rollback

#npm run db:rollback:staging

#npm run db:rollback:dev
```

Seeding test data:

```
npm run db:seed:dev
```
