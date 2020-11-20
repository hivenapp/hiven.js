export function enumerable(value: boolean) {
	return (target: unknown, key: string) => {
		Object.defineProperty(target, key, {
			enumerable: value,
			set(this: unknown, val: unknown) {
				Object.defineProperty(this, key, {
					configurable: true,
					enumerable: value,
					value: val,
					writable: true
				});
			}
		});
	};
}
