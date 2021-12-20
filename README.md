# use-ens-name

Simple React hook for displaying ENS names (Ethereum name service).

## Instalation

```
yarn add use-ens-name
```

## Usage

```jsx
import { useENSName } from 'use-ens-name';

const MyComponent = ({ address }) => {
  const name = useENSName(address)

  return <div>ENS name: {name}</div>
}
```

The hook will return `null` when loading, or when no name is found. You can also pass a fallback string:

```jsx
import { useENSName } from 'use-ens-name';

const MyComponent = ({ address }) => {
  const name = useENSName(address, '(unknown)')

  return <div>ENS name: {name}</div>
}
```
