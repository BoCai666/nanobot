/**
 * Svelte Store Mock 工具
 * 用于 Svelte 5 Runes ($state, $derived) 的测试模拟
 */

/**
 * 创建可写的 store mock（支持 Svelte 5 $state 语法）
 */
export function createMockWritable<T>(initialValue: T) {
	let value = initialValue;

	const subscribers = new Set<(value: T) => void>();

	return {
		/** 当前值 */
		get value() {
			return value;
		},

		/** 设置新值 */
		set(newValue: T) {
			value = newValue;
			subscribers.forEach(callback => callback(value));
		},

		/** 订阅变化 */
		subscribe(callback: (value: T) => void) {
			subscribers.add(callback);
			callback(value); // 立即调用一次
			return () => subscribers.delete(callback);
		},

		/** 更新值（使用更新函数） */
		update(fn: (value: T) => T) {
			const newValue = fn(value);
			this.set(newValue);
		},

		/** 重置为初始值 */
		reset() {
			value = initialValue;
			subscribers.forEach(callback => callback(value));
		},
	};
}

/**
 * 创建只读的 store mock（支持 Svelte 5 $derived 语法）
 */
export function createMockReadable<T>(value: T) {
	const subscribers = new Set<(value: T) => void>();

	return {
		/** 当前值 */
		get value() {
			return value;
		},

		/** 订阅变化 */
		subscribe(callback: (value: T) => void) {
			subscribers.add(callback);
			callback(value);
			return () => subscribers.delete(callback);
		},

		/** 更新内部值（仅供测试使用） */
		set(newValue: T) {
			value = newValue;
			subscribers.forEach(callback => callback(value));
		},
	};
}

/**
 * 创建派生 store mock
 */
export function createMockDerived<T, U>(
	store: { value: T; subscribe: (fn: (value: T) => void) => () => void },
	fn: (value: T) => U
) {
	let derivedValue = fn(store.value);

	store.subscribe(value => {
		derivedValue = fn(value);
	});

	return createMockReadable(derivedValue);
}

/**
 * 组合多个 store
 */
export function combineStores<T extends Record<string, unknown>>(
	stores: { [K in keyof T]: { value: T[K]; subscribe: (fn: (value: T[K]) => void) => () => void } }
) {
	type StoreKeys = keyof T;

	const combined = createMockWritable<{ [K in StoreKeys]: T[K] }>(
		Object.fromEntries(
			Object.entries(stores).map(([key, store]) => [key, store.value])
		) as { [K in StoreKeys]: T[K] }
	);

	Object.entries(stores).forEach(([key, store]) => {
		store.subscribe((value: T[keyof T]) => {
			combined.set({ ...combined.value, [key]: value });
		});
	});

	return combined;
}

/**
 * 创建 mock store 集合的工厂函数
 */
export function createMockStoreFactory<T extends Record<string, unknown>>(
	initialValues: T
) {
	const stores = {} as { [K in keyof T]: ReturnType<typeof createMockWritable<T[K]>> };

	Object.entries(initialValues).forEach(([key, value]) => {
		stores[key as keyof T] = createMockWritable(value as T[keyof T]);
	});

	return {
		/** 获取 store */
		get<K extends keyof T>(key: K) {
			return stores[key];
		},

		/** 获取所有 stores */
		all() {
			return stores;
		},

		/** 重置所有 stores */
		reset() {
			Object.entries(initialValues).forEach(([key, value]) => {
				stores[key as keyof T].set(value as T[keyof T]);
			});
		},

		/** 设置单个 store 的值 */
		set<K extends keyof T>(key: K, value: T[K]) {
			stores[key].set(value);
		},
	};
}
