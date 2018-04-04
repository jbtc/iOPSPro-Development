var modules = [
    './collections/collection.js',
    './collections/comparer.js',
    './collections/dictionary.js',
    './collections/equality-comparer.js',
    './collections/grouping.js',
    './collections/hash-set.js',
    './collections/key-value-pair.js',
    './collections/linked-list.js',
    './collections/list.js',
    './collections/lookup.js',
    './collections/map.js',
    './collections/queue.js',
    './collections/read-only-collection.js',
    './collections/set.js',
    './collections/sorted-list.js',
    './collections/stack.js',
    './core/create.js',
    './core/iterable.js',
    './core/iterator.js',
    './linq/aggregate.js',
    './linq/all.js',
    './linq/any.js',
    './linq/average.js',
    './linq/concat.js',
    './linq/contains.js',
    './linq/count.js',
    './linq/default-if-empty.js',
    './linq/distinct.js',
    './linq/element-at.js',
    './linq/except.js',
    './linq/first-or-default.js',
    './linq/first.js',
    './linq/for-each.js',
    './linq/group-by.js',
    './linq/group-join.js',
    './linq/intersect.js',
    './linq/join.js',
    './linq/last-or-default.js',
    './linq/last.js',
    './linq/max.js',
    './linq/min.js',
    './linq/of-type.js',
    './linq/range.js',
    './linq/repeat.js',
    './linq/reverse.js',
    './linq/select-many.js',
    './linq/select.js',
    './linq/sequence-equal.js',
    './linq/single-or-default.js',
    './linq/single.js',
    './linq/skip-while.js',
    './linq/skip.js',
    './linq/sum.js',
    './linq/take-while.js',
    './linq/take.js',
    './linq/to-array.js',
    './linq/to-dictionary.js',
    './linq/to-list.js',
    './linq/union.js',
    './linq/where.js',
    './linq/zip.js',
    './runtime/compare.js',
    './runtime/equals.js',
    './runtime/hash.js'
];

(function () {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        for (var i = 0; i < modules.length; i++) {
            require(modules[i]);
        }
    }
    else if (typeof define === 'function') {
        require(modules);
    }
})();