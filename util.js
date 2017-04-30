// immutable util

export function push(array, item) {
	return array.concat(item)
}

const spawn = typeof setImmediate === 'function'
	? setImmediate
	: fn => setTimeout(fn, 1)

export function after(timeout, fn) {
	// return (timeout > 0) ? setTimeout(fn, timeout) : setImmediate(fn)
	return (timeout > 0) ? setTimeout(fn, timeout) : spawn(fn)
}

/**
 * A wait function to delay promises execution :
 * somePromise
 * 	.then(delay(100))
 * 	.then(function(data){
 *    // handle result from somePromise
 * 	})
 *
 * @param      {integer}   timeout  The timeout
 * @return     {Promise}
 */
export function delay(timeout = 1) {
	return function(...args) {
		return new Promise(function(ok){
			after(timeout, () => ok(...args))
		})
	}
}

export function different(a, b) {
	return a !== b
}

export function same(a, b) {
	return !different(a, b)
}

export function subSame(a, b, k) {
	return same(a[k], b[k])
}

// React component props
export function rPropsChanged(nextProps) {
	return different(this.props, nextProps)
}

// React component prop sub
export function rPropChanged(propName) {
	return function(nextProps) {
		return different(this.props[propName], nextProps[propName])
	}
}

// React component state
export function rStateChanged(_nextProps, nextState) {
	return different(this.state, nextState)
}

// React component props & state
export function rChanged(nextProps, nextState) {
	return different(this.props, nextProps) || different(this.state, nextState)
}

export function simpleSorter(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

// Seamless Immutable sort
export function sort(array, comparator = simpleSorter) {
	if (array.asMutable) {
		array = array.asMutable()
	} else {
		array = array.slice()
	}
	return array.sort(comparator)
}

export function sortBy(fn) {
  return function(a, b) {
    return simpleSorter(fn(a), fn(b))
  }
}

sortBy.key = function(k) {
	return sortBy(o => o[k])
}

export function getIn(...path) {
	/**
	 * if one array is provided, it's the path. Else, the arguments list is the
	 * path
	 */
	if (Array.isArray(arguments[0])) {
		path = arguments[0]
	}
	return function(object) {
		// (!= null) works with undefined too
		let i, len
		for(i = 0, len = path.length; i < len && object != null; i++) {
			object = object[path[i]]
		}
		// check if we ran all the path
		return i === len ? object : void 0
	}
}

// React Redux Connect comparator for seamless immutable state
export function sameIn(path) {
	let getter = getIn(path)
	return function(objectA, objectB) {
		return same(getter(objectA), getter(objectB))
	}
}

export function sameInAll(...paths) {
	return function(objectA, objectB) {
		let i, len
		for(i = 0, len = paths.length; i < len; i++) {
			let comp = sameIn(paths[i])
			let same = comp(objectA, objectB)
			if (!same) {
				return false
			}
		}
		return true
	}
}

export function deduper() {
	var pool = []
	return function(key, value) {
		if (typeof value === 'object') {
			if (pool.indexOf(value) === -1) {
				pool.push(value)
				return value
			} else {
				// Already seen
				return "__RECURSION__"
			}
		} else {
			return value
		}
	}
}

export function pretty(value, indent = '  ') {
	return JSON.stringify(value, deduper(), indent)
}

export function _return(x) { return x }

export function get(k) {
	return function(o) {
		return o[k]
	}
}

export function inspector(msg = '', ...args) {
	msg = 'INSPECT ' + msg
	return function(value) {
		console.info.call(console, msg, ...args)
		console.debug(value)
		return value
	}
}

export function mutmap(ar, fn) {
	let res = []
	ar.forEach((x, i, a) => res.push(fn(x, i, a)))
	return res
}

export function strf(format, ...args) {
	return format.replace(/%s/g, function(){
		return args.shift()
	})
}

export function xor(a, b) {
	return (a && !b) || (!a && b)
}

export const k = (val) => () => val
