
# compare-stylesheet

## Index

### Functions

* [areEqual](README.md#const-areequal)
* [compare](README.md#const-compare)
* [isSubsetOf](README.md#const-issubsetof)
* [normalize](README.md#const-normalize)
* [normalizeBlock](README.md#const-normalizeblock)

## Functions

### `Const` areEqual

▸ **areEqual**(`a`: string, `b`: string): *boolean*

*Defined in [index.ts:56](https://github.com/tbjgolden/typescript-library-starter/blob/fc24b2c/src/index.ts#L56)*

**Parameters:**

Name | Type |
------ | ------ |
`a` | string |
`b` | string |

**Returns:** *boolean*

___

### `Const` compare

▸ **compare**(`a`: string, `b`: string): *[string[][], string[][]]*

*Defined in [index.ts:23](https://github.com/tbjgolden/typescript-library-starter/blob/fc24b2c/src/index.ts#L23)*

**Parameters:**

Name | Type |
------ | ------ |
`a` | string |
`b` | string |

**Returns:** *[string[][], string[][]]*

___

### `Const` isSubsetOf

▸ **isSubsetOf**(`sub`: string, `sup`: string): *boolean*

*Defined in [index.ts:61](https://github.com/tbjgolden/typescript-library-starter/blob/fc24b2c/src/index.ts#L61)*

**Parameters:**

Name | Type |
------ | ------ |
`sub` | string |
`sup` | string |

**Returns:** *boolean*

___

### `Const` normalize

▸ **normalize**(`css`: string): *string[][]*

*Defined in [index.ts:4](https://github.com/tbjgolden/typescript-library-starter/blob/fc24b2c/src/index.ts#L4)*

**Parameters:**

Name | Type |
------ | ------ |
`css` | string |

**Returns:** *string[][]*

___

### `Const` normalizeBlock

▸ **normalizeBlock**(`node`: StyleSheetPlain | BlockPlain, `addPath`: function, `path`: string[]): *void[]*

*Defined in [index.ts:64](https://github.com/tbjgolden/typescript-library-starter/blob/fc24b2c/src/index.ts#L64)*

**Parameters:**

▪ **node**: *StyleSheetPlain | BlockPlain*

▪ **addPath**: *function*

▸ (`path`: string[]): *void*

**Parameters:**

Name | Type |
------ | ------ |
`path` | string[] |

▪ **path**: *string[]*

**Returns:** *void[]*
