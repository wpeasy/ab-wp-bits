const DEV = false;
var is_array = Array.isArray;
var index_of = Array.prototype.indexOf;
var array_from = Array.from;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var get_descriptors = Object.getOwnPropertyDescriptors;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
var get_prototype_of = Object.getPrototypeOf;
var is_extensible = Object.isExtensible;
function is_function(thing) {
  return typeof thing === "function";
}
const noop = () => {
};
function run_all(arr) {
  for (var i = 0; i < arr.length; i++) {
    arr[i]();
  }
}
function deferred() {
  var resolve;
  var reject;
  var promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
const DERIVED = 1 << 1;
const EFFECT = 1 << 2;
const RENDER_EFFECT = 1 << 3;
const MANAGED_EFFECT = 1 << 24;
const BLOCK_EFFECT = 1 << 4;
const BRANCH_EFFECT = 1 << 5;
const ROOT_EFFECT = 1 << 6;
const BOUNDARY_EFFECT = 1 << 7;
const CONNECTED = 1 << 9;
const CLEAN = 1 << 10;
const DIRTY = 1 << 11;
const MAYBE_DIRTY = 1 << 12;
const INERT = 1 << 13;
const DESTROYED = 1 << 14;
const EFFECT_RAN = 1 << 15;
const EFFECT_TRANSPARENT = 1 << 16;
const EAGER_EFFECT = 1 << 17;
const HEAD_EFFECT = 1 << 18;
const EFFECT_PRESERVED = 1 << 19;
const USER_EFFECT = 1 << 20;
const WAS_MARKED = 1 << 15;
const REACTION_IS_UPDATING = 1 << 21;
const ASYNC = 1 << 22;
const ERROR_VALUE = 1 << 23;
const STATE_SYMBOL = Symbol("$state");
const LEGACY_PROPS = Symbol("legacy props");
const LOADING_ATTR_SYMBOL = Symbol("");
const STALE_REACTION = new class StaleReactionError extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function async_derived_orphan() {
  {
    throw new Error(`https://svelte.dev/e/async_derived_orphan`);
  }
}
function effect_in_teardown(rune) {
  {
    throw new Error(`https://svelte.dev/e/effect_in_teardown`);
  }
}
function effect_in_unowned_derived() {
  {
    throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
  }
}
function effect_orphan(rune) {
  {
    throw new Error(`https://svelte.dev/e/effect_orphan`);
  }
}
function effect_update_depth_exceeded() {
  {
    throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
  }
}
function props_invalid_value(key) {
  {
    throw new Error(`https://svelte.dev/e/props_invalid_value`);
  }
}
function state_descriptors_fixed() {
  {
    throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
  }
}
function state_prototype_fixed() {
  {
    throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
  }
}
function state_unsafe_mutation() {
  {
    throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
  }
}
function svelte_boundary_reset_onerror() {
  {
    throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
  }
}
const EACH_ITEM_REACTIVE = 1;
const EACH_INDEX_REACTIVE = 1 << 1;
const EACH_IS_CONTROLLED = 1 << 2;
const EACH_IS_ANIMATED = 1 << 3;
const EACH_ITEM_IMMUTABLE = 1 << 4;
const PROPS_IS_IMMUTABLE = 1;
const PROPS_IS_UPDATED = 1 << 2;
const PROPS_IS_BINDABLE = 1 << 3;
const PROPS_IS_LAZY_INITIAL = 1 << 4;
const TRANSITION_GLOBAL = 1 << 2;
const TEMPLATE_FRAGMENT = 1;
const TEMPLATE_USE_IMPORT_NODE = 1 << 1;
const UNINITIALIZED = Symbol();
const NAMESPACE_HTML = "http://www.w3.org/1999/xhtml";
function svelte_boundary_reset_noop() {
  {
    console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
  }
}
function equals(value) {
  return value === this.v;
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
function safe_equals(value) {
  return !safe_not_equal(value, this.v);
}
let tracing_mode_flag = false;
let component_context = null;
function set_component_context(context) {
  component_context = context;
}
function push(props, runes = false, fn) {
  component_context = {
    p: component_context,
    i: false,
    c: null,
    e: null,
    s: props,
    x: null,
    l: null
  };
}
function pop(component) {
  var context = (
    /** @type {ComponentContext} */
    component_context
  );
  var effects = context.e;
  if (effects !== null) {
    context.e = null;
    for (var fn of effects) {
      create_user_effect(fn);
    }
  }
  context.i = true;
  component_context = context.p;
  return (
    /** @type {T} */
    {}
  );
}
function is_runes() {
  return true;
}
let micro_tasks = [];
function run_micro_tasks() {
  var tasks = micro_tasks;
  micro_tasks = [];
  run_all(tasks);
}
function queue_micro_task(fn) {
  if (micro_tasks.length === 0 && !is_flushing_sync) {
    var tasks = micro_tasks;
    queueMicrotask(() => {
      if (tasks === micro_tasks) run_micro_tasks();
    });
  }
  micro_tasks.push(fn);
}
function flush_tasks() {
  while (micro_tasks.length > 0) {
    run_micro_tasks();
  }
}
function handle_error(error) {
  var effect2 = active_effect;
  if (effect2 === null) {
    active_reaction.f |= ERROR_VALUE;
    return error;
  }
  if ((effect2.f & EFFECT_RAN) === 0) {
    if ((effect2.f & BOUNDARY_EFFECT) === 0) {
      throw error;
    }
    effect2.b.error(error);
  } else {
    invoke_error_boundary(error, effect2);
  }
}
function invoke_error_boundary(error, effect2) {
  while (effect2 !== null) {
    if ((effect2.f & BOUNDARY_EFFECT) !== 0) {
      try {
        effect2.b.error(error);
        return;
      } catch (e) {
        error = e;
      }
    }
    effect2 = effect2.parent;
  }
  throw error;
}
const batches = /* @__PURE__ */ new Set();
let current_batch = null;
let previous_batch = null;
let batch_values = null;
let queued_root_effects = [];
let last_scheduled_effect = null;
let is_flushing = false;
let is_flushing_sync = false;
class Batch {
  committed = false;
  /**
   * The current values of any sources that are updated in this batch
   * They keys of this map are identical to `this.#previous`
   * @type {Map<Source, any>}
   */
  current = /* @__PURE__ */ new Map();
  /**
   * The values of any sources that are updated in this batch _before_ those updates took place.
   * They keys of this map are identical to `this.#current`
   * @type {Map<Source, any>}
   */
  previous = /* @__PURE__ */ new Map();
  /**
   * When the batch is committed (and the DOM is updated), we need to remove old branches
   * and append new ones by calling the functions added inside (if/each/key/etc) blocks
   * @type {Set<() => void>}
   */
  #commit_callbacks = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #discard_callbacks = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #pending = 0;
  /**
   * The number of async effects that are currently in flight, _not_ inside a pending boundary
   */
  #blocking_pending = 0;
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #deferred = null;
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Effect[]}
   */
  #dirty_effects = [];
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Effect[]}
   */
  #maybe_dirty_effects = [];
  /**
   * A set of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`
   * @type {Set<Effect>}
   */
  skipped_effects = /* @__PURE__ */ new Set();
  is_fork = false;
  is_deferred() {
    return this.is_fork || this.#blocking_pending > 0;
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(root_effects) {
    queued_root_effects = [];
    previous_batch = null;
    this.apply();
    var target = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: [],
      block_effects: []
    };
    for (const root2 of root_effects) {
      this.#traverse_effect_tree(root2, target);
    }
    if (!this.is_fork) {
      this.#resolve();
    }
    if (this.is_deferred()) {
      this.#defer_effects(target.effects);
      this.#defer_effects(target.render_effects);
      this.#defer_effects(target.block_effects);
    } else {
      previous_batch = this;
      current_batch = null;
      flush_queued_effects(target.render_effects);
      flush_queued_effects(target.effects);
      previous_batch = null;
      this.#deferred?.resolve();
    }
    batch_values = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {EffectTarget} target
   */
  #traverse_effect_tree(root2, target) {
    root2.f ^= CLEAN;
    var effect2 = root2.first;
    while (effect2 !== null) {
      var flags2 = effect2.f;
      var is_branch = (flags2 & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
      var is_skippable_branch = is_branch && (flags2 & CLEAN) !== 0;
      var skip = is_skippable_branch || (flags2 & INERT) !== 0 || this.skipped_effects.has(effect2);
      if ((effect2.f & BOUNDARY_EFFECT) !== 0 && effect2.b?.is_pending()) {
        target = {
          parent: target,
          effect: effect2,
          effects: [],
          render_effects: [],
          block_effects: []
        };
      }
      if (!skip && effect2.fn !== null) {
        if (is_branch) {
          effect2.f ^= CLEAN;
        } else if ((flags2 & EFFECT) !== 0) {
          target.effects.push(effect2);
        } else if (is_dirty(effect2)) {
          if ((effect2.f & BLOCK_EFFECT) !== 0) target.block_effects.push(effect2);
          update_effect(effect2);
        }
        var child2 = effect2.first;
        if (child2 !== null) {
          effect2 = child2;
          continue;
        }
      }
      var parent = effect2.parent;
      effect2 = effect2.next;
      while (effect2 === null && parent !== null) {
        if (parent === target.effect) {
          this.#defer_effects(target.effects);
          this.#defer_effects(target.render_effects);
          this.#defer_effects(target.block_effects);
          target = /** @type {EffectTarget} */
          target.parent;
        }
        effect2 = parent.next;
        parent = parent.parent;
      }
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #defer_effects(effects) {
    for (const e of effects) {
      const target = (e.f & DIRTY) !== 0 ? this.#dirty_effects : this.#maybe_dirty_effects;
      target.push(e);
      this.#clear_marked(e.deps);
      set_signal_status(e, CLEAN);
    }
  }
  /**
   * @param {Value[] | null} deps
   */
  #clear_marked(deps) {
    if (deps === null) return;
    for (const dep of deps) {
      if ((dep.f & DERIVED) === 0 || (dep.f & WAS_MARKED) === 0) {
        continue;
      }
      dep.f ^= WAS_MARKED;
      this.#clear_marked(
        /** @type {Derived} */
        dep.deps
      );
    }
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(source2, value) {
    if (!this.previous.has(source2)) {
      this.previous.set(source2, value);
    }
    if ((source2.f & ERROR_VALUE) === 0) {
      this.current.set(source2, source2.v);
      batch_values?.set(source2, source2.v);
    }
  }
  activate() {
    current_batch = this;
    this.apply();
  }
  deactivate() {
    if (current_batch !== this) return;
    current_batch = null;
    batch_values = null;
  }
  flush() {
    this.activate();
    if (queued_root_effects.length > 0) {
      flush_effects();
      if (current_batch !== null && current_batch !== this) {
        return;
      }
    } else if (this.#pending === 0) {
      this.process([]);
    }
    this.deactivate();
  }
  discard() {
    for (const fn of this.#discard_callbacks) fn(this);
    this.#discard_callbacks.clear();
  }
  #resolve() {
    if (this.#blocking_pending === 0) {
      for (const fn of this.#commit_callbacks) fn();
      this.#commit_callbacks.clear();
    }
    if (this.#pending === 0) {
      this.#commit();
    }
  }
  #commit() {
    if (batches.size > 1) {
      this.previous.clear();
      var previous_batch_values = batch_values;
      var is_earlier = true;
      var dummy_target = {
        parent: null,
        effect: null,
        effects: [],
        render_effects: [],
        block_effects: []
      };
      for (const batch of batches) {
        if (batch === this) {
          is_earlier = false;
          continue;
        }
        const sources = [];
        for (const [source2, value] of this.current) {
          if (batch.current.has(source2)) {
            if (is_earlier && value !== batch.current.get(source2)) {
              batch.current.set(source2, value);
            } else {
              continue;
            }
          }
          sources.push(source2);
        }
        if (sources.length === 0) {
          continue;
        }
        const others = [...batch.current.keys()].filter((s) => !this.current.has(s));
        if (others.length > 0) {
          var prev_queued_root_effects = queued_root_effects;
          queued_root_effects = [];
          const marked = /* @__PURE__ */ new Set();
          const checked = /* @__PURE__ */ new Map();
          for (const source2 of sources) {
            mark_effects(source2, others, marked, checked);
          }
          if (queued_root_effects.length > 0) {
            current_batch = batch;
            batch.apply();
            for (const root2 of queued_root_effects) {
              batch.#traverse_effect_tree(root2, dummy_target);
            }
            batch.deactivate();
          }
          queued_root_effects = prev_queued_root_effects;
        }
      }
      current_batch = null;
      batch_values = previous_batch_values;
    }
    this.committed = true;
    batches.delete(this);
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(blocking) {
    this.#pending += 1;
    if (blocking) this.#blocking_pending += 1;
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(blocking) {
    this.#pending -= 1;
    if (blocking) this.#blocking_pending -= 1;
    this.revive();
  }
  revive() {
    for (const e of this.#dirty_effects) {
      set_signal_status(e, DIRTY);
      schedule_effect(e);
    }
    for (const e of this.#maybe_dirty_effects) {
      set_signal_status(e, MAYBE_DIRTY);
      schedule_effect(e);
    }
    this.#dirty_effects = [];
    this.#maybe_dirty_effects = [];
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(fn) {
    this.#commit_callbacks.add(fn);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(fn) {
    this.#discard_callbacks.add(fn);
  }
  settled() {
    return (this.#deferred ??= deferred()).promise;
  }
  static ensure() {
    if (current_batch === null) {
      const batch = current_batch = new Batch();
      batches.add(current_batch);
      if (!is_flushing_sync) {
        Batch.enqueue(() => {
          if (current_batch !== batch) {
            return;
          }
          batch.flush();
        });
      }
    }
    return current_batch;
  }
  /** @param {() => void} task */
  static enqueue(task) {
    queue_micro_task(task);
  }
  apply() {
    return;
  }
}
function flushSync(fn) {
  var was_flushing_sync = is_flushing_sync;
  is_flushing_sync = true;
  try {
    var result;
    if (fn) ;
    while (true) {
      flush_tasks();
      if (queued_root_effects.length === 0) {
        current_batch?.flush();
        if (queued_root_effects.length === 0) {
          last_scheduled_effect = null;
          return (
            /** @type {T} */
            result
          );
        }
      }
      flush_effects();
    }
  } finally {
    is_flushing_sync = was_flushing_sync;
  }
}
function flush_effects() {
  var was_updating_effect = is_updating_effect;
  is_flushing = true;
  var source_stacks = null;
  try {
    var flush_count = 0;
    set_is_updating_effect(true);
    while (queued_root_effects.length > 0) {
      var batch = Batch.ensure();
      if (flush_count++ > 1e3) {
        var updates, entry;
        if (DEV) ;
        infinite_loop_guard();
      }
      batch.process(queued_root_effects);
      old_values.clear();
      if (DEV) ;
    }
  } finally {
    is_flushing = false;
    set_is_updating_effect(was_updating_effect);
    last_scheduled_effect = null;
  }
}
function infinite_loop_guard() {
  try {
    effect_update_depth_exceeded();
  } catch (error) {
    invoke_error_boundary(error, last_scheduled_effect);
  }
}
let eager_block_effects = null;
function flush_queued_effects(effects) {
  var length = effects.length;
  if (length === 0) return;
  var i = 0;
  while (i < length) {
    var effect2 = effects[i++];
    if ((effect2.f & (DESTROYED | INERT)) === 0 && is_dirty(effect2)) {
      eager_block_effects = /* @__PURE__ */ new Set();
      update_effect(effect2);
      if (effect2.deps === null && effect2.first === null && effect2.nodes === null) {
        if (effect2.teardown === null && effect2.ac === null) {
          unlink_effect(effect2);
        } else {
          effect2.fn = null;
        }
      }
      if (eager_block_effects?.size > 0) {
        old_values.clear();
        for (const e of eager_block_effects) {
          if ((e.f & (DESTROYED | INERT)) !== 0) continue;
          const ordered_effects = [e];
          let ancestor = e.parent;
          while (ancestor !== null) {
            if (eager_block_effects.has(ancestor)) {
              eager_block_effects.delete(ancestor);
              ordered_effects.push(ancestor);
            }
            ancestor = ancestor.parent;
          }
          for (let j = ordered_effects.length - 1; j >= 0; j--) {
            const e2 = ordered_effects[j];
            if ((e2.f & (DESTROYED | INERT)) !== 0) continue;
            update_effect(e2);
          }
        }
        eager_block_effects.clear();
      }
    }
  }
  eager_block_effects = null;
}
function mark_effects(value, sources, marked, checked) {
  if (marked.has(value)) return;
  marked.add(value);
  if (value.reactions !== null) {
    for (const reaction of value.reactions) {
      const flags2 = reaction.f;
      if ((flags2 & DERIVED) !== 0) {
        mark_effects(
          /** @type {Derived} */
          reaction,
          sources,
          marked,
          checked
        );
      } else if ((flags2 & (ASYNC | BLOCK_EFFECT)) !== 0 && (flags2 & DIRTY) === 0 && depends_on(reaction, sources, checked)) {
        set_signal_status(reaction, DIRTY);
        schedule_effect(
          /** @type {Effect} */
          reaction
        );
      }
    }
  }
}
function depends_on(reaction, sources, checked) {
  const depends = checked.get(reaction);
  if (depends !== void 0) return depends;
  if (reaction.deps !== null) {
    for (const dep of reaction.deps) {
      if (sources.includes(dep)) {
        return true;
      }
      if ((dep.f & DERIVED) !== 0 && depends_on(
        /** @type {Derived} */
        dep,
        sources,
        checked
      )) {
        checked.set(
          /** @type {Derived} */
          dep,
          true
        );
        return true;
      }
    }
  }
  checked.set(reaction, false);
  return false;
}
function schedule_effect(signal) {
  var effect2 = last_scheduled_effect = signal;
  while (effect2.parent !== null) {
    effect2 = effect2.parent;
    var flags2 = effect2.f;
    if (is_flushing && effect2 === active_effect && (flags2 & BLOCK_EFFECT) !== 0 && (flags2 & HEAD_EFFECT) === 0) {
      return;
    }
    if ((flags2 & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
      if ((flags2 & CLEAN) === 0) return;
      effect2.f ^= CLEAN;
    }
  }
  queued_root_effects.push(effect2);
}
function createSubscriber(start) {
  let subscribers = 0;
  let version = source(0);
  let stop;
  return () => {
    if (effect_tracking()) {
      get(version);
      render_effect(() => {
        if (subscribers === 0) {
          stop = untrack(() => start(() => increment(version)));
        }
        subscribers += 1;
        return () => {
          queue_micro_task(() => {
            subscribers -= 1;
            if (subscribers === 0) {
              stop?.();
              stop = void 0;
              increment(version);
            }
          });
        };
      });
    }
  };
}
var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED | BOUNDARY_EFFECT;
function boundary(node, props, children) {
  new Boundary(node, props, children);
}
class Boundary {
  /** @type {Boundary | null} */
  parent;
  #pending = false;
  /** @type {TemplateNode} */
  #anchor;
  /** @type {TemplateNode | null} */
  #hydrate_open = null;
  /** @type {BoundaryProps} */
  #props;
  /** @type {((anchor: Node) => void)} */
  #children;
  /** @type {Effect} */
  #effect;
  /** @type {Effect | null} */
  #main_effect = null;
  /** @type {Effect | null} */
  #pending_effect = null;
  /** @type {Effect | null} */
  #failed_effect = null;
  /** @type {DocumentFragment | null} */
  #offscreen_fragment = null;
  /** @type {TemplateNode | null} */
  #pending_anchor = null;
  #local_pending_count = 0;
  #pending_count = 0;
  #is_creating_fallback = false;
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #effect_pending = null;
  #effect_pending_subscriber = createSubscriber(() => {
    this.#effect_pending = source(this.#local_pending_count);
    return () => {
      this.#effect_pending = null;
    };
  });
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(node, props, children) {
    this.#anchor = node;
    this.#props = props;
    this.#children = children;
    this.parent = /** @type {Effect} */
    active_effect.b;
    this.#pending = !!this.#props.pending;
    this.#effect = block(() => {
      active_effect.b = this;
      {
        var anchor = this.#get_anchor();
        try {
          this.#main_effect = branch(() => children(anchor));
        } catch (error) {
          this.error(error);
        }
        if (this.#pending_count > 0) {
          this.#show_pending_snippet();
        } else {
          this.#pending = false;
        }
      }
      return () => {
        this.#pending_anchor?.remove();
      };
    }, flags);
  }
  #hydrate_resolved_content() {
    try {
      this.#main_effect = branch(() => this.#children(this.#anchor));
    } catch (error) {
      this.error(error);
    }
    this.#pending = false;
  }
  #hydrate_pending_content() {
    const pending = this.#props.pending;
    if (!pending) {
      return;
    }
    this.#pending_effect = branch(() => pending(this.#anchor));
    Batch.enqueue(() => {
      var anchor = this.#get_anchor();
      this.#main_effect = this.#run(() => {
        Batch.ensure();
        return branch(() => this.#children(anchor));
      });
      if (this.#pending_count > 0) {
        this.#show_pending_snippet();
      } else {
        pause_effect(
          /** @type {Effect} */
          this.#pending_effect,
          () => {
            this.#pending_effect = null;
          }
        );
        this.#pending = false;
      }
    });
  }
  #get_anchor() {
    var anchor = this.#anchor;
    if (this.#pending) {
      this.#pending_anchor = create_text();
      this.#anchor.before(this.#pending_anchor);
      anchor = this.#pending_anchor;
    }
    return anchor;
  }
  /**
   * Returns `true` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_pending() {
    return this.#pending || !!this.parent && this.parent.is_pending();
  }
  has_pending_snippet() {
    return !!this.#props.pending;
  }
  /**
   * @param {() => Effect | null} fn
   */
  #run(fn) {
    var previous_effect = active_effect;
    var previous_reaction = active_reaction;
    var previous_ctx = component_context;
    set_active_effect(this.#effect);
    set_active_reaction(this.#effect);
    set_component_context(this.#effect.ctx);
    try {
      return fn();
    } catch (e) {
      handle_error(e);
      return null;
    } finally {
      set_active_effect(previous_effect);
      set_active_reaction(previous_reaction);
      set_component_context(previous_ctx);
    }
  }
  #show_pending_snippet() {
    const pending = (
      /** @type {(anchor: Node) => void} */
      this.#props.pending
    );
    if (this.#main_effect !== null) {
      this.#offscreen_fragment = document.createDocumentFragment();
      this.#offscreen_fragment.append(
        /** @type {TemplateNode} */
        this.#pending_anchor
      );
      move_effect(this.#main_effect, this.#offscreen_fragment);
    }
    if (this.#pending_effect === null) {
      this.#pending_effect = branch(() => pending(this.#anchor));
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   */
  #update_pending_count(d) {
    if (!this.has_pending_snippet()) {
      if (this.parent) {
        this.parent.#update_pending_count(d);
      }
      return;
    }
    this.#pending_count += d;
    if (this.#pending_count === 0) {
      this.#pending = false;
      if (this.#pending_effect) {
        pause_effect(this.#pending_effect, () => {
          this.#pending_effect = null;
        });
      }
      if (this.#offscreen_fragment) {
        this.#anchor.before(this.#offscreen_fragment);
        this.#offscreen_fragment = null;
      }
    }
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(d) {
    this.#update_pending_count(d);
    this.#local_pending_count += d;
    if (this.#effect_pending) {
      internal_set(this.#effect_pending, this.#local_pending_count);
    }
  }
  get_effect_pending() {
    this.#effect_pending_subscriber();
    return get(
      /** @type {Source<number>} */
      this.#effect_pending
    );
  }
  /** @param {unknown} error */
  error(error) {
    var onerror = this.#props.onerror;
    let failed = this.#props.failed;
    if (this.#is_creating_fallback || !onerror && !failed) {
      throw error;
    }
    if (this.#main_effect) {
      destroy_effect(this.#main_effect);
      this.#main_effect = null;
    }
    if (this.#pending_effect) {
      destroy_effect(this.#pending_effect);
      this.#pending_effect = null;
    }
    if (this.#failed_effect) {
      destroy_effect(this.#failed_effect);
      this.#failed_effect = null;
    }
    var did_reset = false;
    var calling_on_error = false;
    const reset = () => {
      if (did_reset) {
        svelte_boundary_reset_noop();
        return;
      }
      did_reset = true;
      if (calling_on_error) {
        svelte_boundary_reset_onerror();
      }
      Batch.ensure();
      this.#local_pending_count = 0;
      if (this.#failed_effect !== null) {
        pause_effect(this.#failed_effect, () => {
          this.#failed_effect = null;
        });
      }
      this.#pending = this.has_pending_snippet();
      this.#main_effect = this.#run(() => {
        this.#is_creating_fallback = false;
        return branch(() => this.#children(this.#anchor));
      });
      if (this.#pending_count > 0) {
        this.#show_pending_snippet();
      } else {
        this.#pending = false;
      }
    };
    var previous_reaction = active_reaction;
    try {
      set_active_reaction(null);
      calling_on_error = true;
      onerror?.(error, reset);
      calling_on_error = false;
    } catch (error2) {
      invoke_error_boundary(error2, this.#effect && this.#effect.parent);
    } finally {
      set_active_reaction(previous_reaction);
    }
    if (failed) {
      queue_micro_task(() => {
        this.#failed_effect = this.#run(() => {
          Batch.ensure();
          this.#is_creating_fallback = true;
          try {
            return branch(() => {
              failed(
                this.#anchor,
                () => error,
                () => reset
              );
            });
          } catch (error2) {
            invoke_error_boundary(
              error2,
              /** @type {Effect} */
              this.#effect.parent
            );
            return null;
          } finally {
            this.#is_creating_fallback = false;
          }
        });
      });
    }
  }
}
function flatten(blockers, sync, async, fn) {
  const d = derived;
  if (async.length === 0 && blockers.length === 0) {
    fn(sync.map(d));
    return;
  }
  var batch = current_batch;
  var parent = (
    /** @type {Effect} */
    active_effect
  );
  var restore = capture();
  function run() {
    Promise.all(async.map((expression) => /* @__PURE__ */ async_derived(expression))).then((result) => {
      restore();
      try {
        fn([...sync.map(d), ...result]);
      } catch (error) {
        if ((parent.f & DESTROYED) === 0) {
          invoke_error_boundary(error, parent);
        }
      }
      batch?.deactivate();
      unset_context();
    }).catch((error) => {
      invoke_error_boundary(error, parent);
    });
  }
  if (blockers.length > 0) {
    Promise.all(blockers).then(() => {
      restore();
      try {
        return run();
      } finally {
        batch?.deactivate();
        unset_context();
      }
    });
  } else {
    run();
  }
}
function capture() {
  var previous_effect = active_effect;
  var previous_reaction = active_reaction;
  var previous_component_context = component_context;
  var previous_batch2 = current_batch;
  return function restore(activate_batch = true) {
    set_active_effect(previous_effect);
    set_active_reaction(previous_reaction);
    set_component_context(previous_component_context);
    if (activate_batch) previous_batch2?.activate();
  };
}
function unset_context() {
  set_active_effect(null);
  set_active_reaction(null);
  set_component_context(null);
}
// @__NO_SIDE_EFFECTS__
function derived(fn) {
  var flags2 = DERIVED | DIRTY;
  var parent_derived = active_reaction !== null && (active_reaction.f & DERIVED) !== 0 ? (
    /** @type {Derived} */
    active_reaction
  ) : null;
  if (active_effect !== null) {
    active_effect.f |= EFFECT_PRESERVED;
  }
  const signal = {
    ctx: component_context,
    deps: null,
    effects: null,
    equals,
    f: flags2,
    fn,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      UNINITIALIZED
    ),
    wv: 0,
    parent: parent_derived ?? active_effect,
    ac: null
  };
  return signal;
}
// @__NO_SIDE_EFFECTS__
function async_derived(fn, location) {
  let parent = (
    /** @type {Effect | null} */
    active_effect
  );
  if (parent === null) {
    async_derived_orphan();
  }
  var boundary2 = (
    /** @type {Boundary} */
    parent.b
  );
  var promise = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  );
  var signal = source(
    /** @type {V} */
    UNINITIALIZED
  );
  var should_suspend = !active_reaction;
  var deferreds = /* @__PURE__ */ new Map();
  async_effect(() => {
    var d = deferred();
    promise = d.promise;
    try {
      Promise.resolve(fn()).then(d.resolve, d.reject).then(() => {
        if (batch === current_batch && batch.committed) {
          batch.deactivate();
        }
        unset_context();
      });
    } catch (error) {
      d.reject(error);
      unset_context();
    }
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    if (should_suspend) {
      var blocking = !boundary2.is_pending();
      boundary2.update_pending_count(1);
      batch.increment(blocking);
      deferreds.get(batch)?.reject(STALE_REACTION);
      deferreds.delete(batch);
      deferreds.set(batch, d);
    }
    const handler = (value, error = void 0) => {
      batch.activate();
      if (error) {
        if (error !== STALE_REACTION) {
          signal.f |= ERROR_VALUE;
          internal_set(signal, error);
        }
      } else {
        if ((signal.f & ERROR_VALUE) !== 0) {
          signal.f ^= ERROR_VALUE;
        }
        internal_set(signal, value);
        for (const [b, d2] of deferreds) {
          deferreds.delete(b);
          if (b === batch) break;
          d2.reject(STALE_REACTION);
        }
      }
      if (should_suspend) {
        boundary2.update_pending_count(-1);
        batch.decrement(blocking);
      }
    };
    d.promise.then(handler, (e) => handler(null, e || "unknown"));
  });
  teardown(() => {
    for (const d of deferreds.values()) {
      d.reject(STALE_REACTION);
    }
  });
  return new Promise((fulfil) => {
    function next(p) {
      function go() {
        if (p === promise) {
          fulfil(signal);
        } else {
          next(promise);
        }
      }
      p.then(go, go);
    }
    next(promise);
  });
}
// @__NO_SIDE_EFFECTS__
function user_derived(fn) {
  const d = /* @__PURE__ */ derived(fn);
  push_reaction_value(d);
  return d;
}
// @__NO_SIDE_EFFECTS__
function derived_safe_equal(fn) {
  const signal = /* @__PURE__ */ derived(fn);
  signal.equals = safe_equals;
  return signal;
}
function destroy_derived_effects(derived2) {
  var effects = derived2.effects;
  if (effects !== null) {
    derived2.effects = null;
    for (var i = 0; i < effects.length; i += 1) {
      destroy_effect(
        /** @type {Effect} */
        effects[i]
      );
    }
  }
}
function get_derived_parent_effect(derived2) {
  var parent = derived2.parent;
  while (parent !== null) {
    if ((parent.f & DERIVED) === 0) {
      return (parent.f & DESTROYED) === 0 ? (
        /** @type {Effect} */
        parent
      ) : null;
    }
    parent = parent.parent;
  }
  return null;
}
function execute_derived(derived2) {
  var value;
  var prev_active_effect = active_effect;
  set_active_effect(get_derived_parent_effect(derived2));
  {
    try {
      derived2.f &= ~WAS_MARKED;
      destroy_derived_effects(derived2);
      value = update_reaction(derived2);
    } finally {
      set_active_effect(prev_active_effect);
    }
  }
  return value;
}
function update_derived(derived2) {
  var value = execute_derived(derived2);
  if (!derived2.equals(value)) {
    if (!current_batch?.is_fork) {
      derived2.v = value;
    }
    derived2.wv = increment_write_version();
  }
  if (is_destroying_effect) {
    return;
  }
  if (batch_values !== null) {
    if (effect_tracking() || current_batch?.is_fork) {
      batch_values.set(derived2, value);
    }
  } else {
    var status = (derived2.f & CONNECTED) === 0 ? MAYBE_DIRTY : CLEAN;
    set_signal_status(derived2, status);
  }
}
let eager_effects = /* @__PURE__ */ new Set();
const old_values = /* @__PURE__ */ new Map();
let eager_effects_deferred = false;
function source(v, stack) {
  var signal = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v,
    reactions: null,
    equals,
    rv: 0,
    wv: 0
  };
  return signal;
}
// @__NO_SIDE_EFFECTS__
function state(v, stack) {
  const s = source(v);
  push_reaction_value(s);
  return s;
}
// @__NO_SIDE_EFFECTS__
function mutable_source(initial_value, immutable = false, trackable = true) {
  const s = source(initial_value);
  if (!immutable) {
    s.equals = safe_equals;
  }
  return s;
}
function set(source2, value, should_proxy = false) {
  if (active_reaction !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) && is_runes() && (active_reaction.f & (DERIVED | BLOCK_EFFECT | ASYNC | EAGER_EFFECT)) !== 0 && !current_sources?.includes(source2)) {
    state_unsafe_mutation();
  }
  let new_value = should_proxy ? proxy(value) : value;
  return internal_set(source2, new_value);
}
function internal_set(source2, value) {
  if (!source2.equals(value)) {
    var old_value = source2.v;
    if (is_destroying_effect) {
      old_values.set(source2, value);
    } else {
      old_values.set(source2, old_value);
    }
    source2.v = value;
    var batch = Batch.ensure();
    batch.capture(source2, old_value);
    if ((source2.f & DERIVED) !== 0) {
      if ((source2.f & DIRTY) !== 0) {
        execute_derived(
          /** @type {Derived} */
          source2
        );
      }
      set_signal_status(source2, (source2.f & CONNECTED) !== 0 ? CLEAN : MAYBE_DIRTY);
    }
    source2.wv = increment_write_version();
    mark_reactions(source2, DIRTY);
    if (active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) {
      if (untracked_writes === null) {
        set_untracked_writes([source2]);
      } else {
        untracked_writes.push(source2);
      }
    }
    if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) {
      flush_eager_effects();
    }
  }
  return value;
}
function flush_eager_effects() {
  eager_effects_deferred = false;
  var prev_is_updating_effect = is_updating_effect;
  set_is_updating_effect(true);
  const inspects = Array.from(eager_effects);
  try {
    for (const effect2 of inspects) {
      if ((effect2.f & CLEAN) !== 0) {
        set_signal_status(effect2, MAYBE_DIRTY);
      }
      if (is_dirty(effect2)) {
        update_effect(effect2);
      }
    }
  } finally {
    set_is_updating_effect(prev_is_updating_effect);
  }
  eager_effects.clear();
}
function increment(source2) {
  set(source2, source2.v + 1);
}
function mark_reactions(signal, status) {
  var reactions = signal.reactions;
  if (reactions === null) return;
  var length = reactions.length;
  for (var i = 0; i < length; i++) {
    var reaction = reactions[i];
    var flags2 = reaction.f;
    var not_dirty = (flags2 & DIRTY) === 0;
    if (not_dirty) {
      set_signal_status(reaction, status);
    }
    if ((flags2 & DERIVED) !== 0) {
      var derived2 = (
        /** @type {Derived} */
        reaction
      );
      batch_values?.delete(derived2);
      if ((flags2 & WAS_MARKED) === 0) {
        if (flags2 & CONNECTED) {
          reaction.f |= WAS_MARKED;
        }
        mark_reactions(derived2, MAYBE_DIRTY);
      }
    } else if (not_dirty) {
      if ((flags2 & BLOCK_EFFECT) !== 0 && eager_block_effects !== null) {
        eager_block_effects.add(
          /** @type {Effect} */
          reaction
        );
      }
      schedule_effect(
        /** @type {Effect} */
        reaction
      );
    }
  }
}
function proxy(value) {
  if (typeof value !== "object" || value === null || STATE_SYMBOL in value) {
    return value;
  }
  const prototype = get_prototype_of(value);
  if (prototype !== object_prototype && prototype !== array_prototype) {
    return value;
  }
  var sources = /* @__PURE__ */ new Map();
  var is_proxied_array = is_array(value);
  var version = /* @__PURE__ */ state(0);
  var parent_version = update_version;
  var with_parent = (fn) => {
    if (update_version === parent_version) {
      return fn();
    }
    var reaction = active_reaction;
    var version2 = update_version;
    set_active_reaction(null);
    set_update_version(parent_version);
    var result = fn();
    set_active_reaction(reaction);
    set_update_version(version2);
    return result;
  };
  if (is_proxied_array) {
    sources.set("length", /* @__PURE__ */ state(
      /** @type {any[]} */
      value.length
    ));
  }
  return new Proxy(
    /** @type {any} */
    value,
    {
      defineProperty(_, prop2, descriptor) {
        if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) {
          state_descriptors_fixed();
        }
        var s = sources.get(prop2);
        if (s === void 0) {
          s = with_parent(() => {
            var s2 = /* @__PURE__ */ state(descriptor.value);
            sources.set(prop2, s2);
            return s2;
          });
        } else {
          set(s, descriptor.value, true);
        }
        return true;
      },
      deleteProperty(target, prop2) {
        var s = sources.get(prop2);
        if (s === void 0) {
          if (prop2 in target) {
            const s2 = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED));
            sources.set(prop2, s2);
            increment(version);
          }
        } else {
          set(s, UNINITIALIZED);
          increment(version);
        }
        return true;
      },
      get(target, prop2, receiver) {
        if (prop2 === STATE_SYMBOL) {
          return value;
        }
        var s = sources.get(prop2);
        var exists = prop2 in target;
        if (s === void 0 && (!exists || get_descriptor(target, prop2)?.writable)) {
          s = with_parent(() => {
            var p = proxy(exists ? target[prop2] : UNINITIALIZED);
            var s2 = /* @__PURE__ */ state(p);
            return s2;
          });
          sources.set(prop2, s);
        }
        if (s !== void 0) {
          var v = get(s);
          return v === UNINITIALIZED ? void 0 : v;
        }
        return Reflect.get(target, prop2, receiver);
      },
      getOwnPropertyDescriptor(target, prop2) {
        var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
        if (descriptor && "value" in descriptor) {
          var s = sources.get(prop2);
          if (s) descriptor.value = get(s);
        } else if (descriptor === void 0) {
          var source2 = sources.get(prop2);
          var value2 = source2?.v;
          if (source2 !== void 0 && value2 !== UNINITIALIZED) {
            return {
              enumerable: true,
              configurable: true,
              value: value2,
              writable: true
            };
          }
        }
        return descriptor;
      },
      has(target, prop2) {
        if (prop2 === STATE_SYMBOL) {
          return true;
        }
        var s = sources.get(prop2);
        var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop2);
        if (s !== void 0 || active_effect !== null && (!has || get_descriptor(target, prop2)?.writable)) {
          if (s === void 0) {
            s = with_parent(() => {
              var p = has ? proxy(target[prop2]) : UNINITIALIZED;
              var s2 = /* @__PURE__ */ state(p);
              return s2;
            });
            sources.set(prop2, s);
          }
          var value2 = get(s);
          if (value2 === UNINITIALIZED) {
            return false;
          }
        }
        return has;
      },
      set(target, prop2, value2, receiver) {
        var s = sources.get(prop2);
        var has = prop2 in target;
        if (is_proxied_array && prop2 === "length") {
          for (var i = value2; i < /** @type {Source<number>} */
          s.v; i += 1) {
            var other_s = sources.get(i + "");
            if (other_s !== void 0) {
              set(other_s, UNINITIALIZED);
            } else if (i in target) {
              other_s = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED));
              sources.set(i + "", other_s);
            }
          }
        }
        if (s === void 0) {
          if (!has || get_descriptor(target, prop2)?.writable) {
            s = with_parent(() => /* @__PURE__ */ state(void 0));
            set(s, proxy(value2));
            sources.set(prop2, s);
          }
        } else {
          has = s.v !== UNINITIALIZED;
          var p = with_parent(() => proxy(value2));
          set(s, p);
        }
        var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
        if (descriptor?.set) {
          descriptor.set.call(receiver, value2);
        }
        if (!has) {
          if (is_proxied_array && typeof prop2 === "string") {
            var ls = (
              /** @type {Source<number>} */
              sources.get("length")
            );
            var n = Number(prop2);
            if (Number.isInteger(n) && n >= ls.v) {
              set(ls, n + 1);
            }
          }
          increment(version);
        }
        return true;
      },
      ownKeys(target) {
        get(version);
        var own_keys = Reflect.ownKeys(target).filter((key2) => {
          var source3 = sources.get(key2);
          return source3 === void 0 || source3.v !== UNINITIALIZED;
        });
        for (var [key, source2] of sources) {
          if (source2.v !== UNINITIALIZED && !(key in target)) {
            own_keys.push(key);
          }
        }
        return own_keys;
      },
      setPrototypeOf() {
        state_prototype_fixed();
      }
    }
  );
}
var $window;
var is_firefox;
var first_child_getter;
var next_sibling_getter;
function init_operations() {
  if ($window !== void 0) {
    return;
  }
  $window = window;
  is_firefox = /Firefox/.test(navigator.userAgent);
  var element_prototype = Element.prototype;
  var node_prototype = Node.prototype;
  var text_prototype = Text.prototype;
  first_child_getter = get_descriptor(node_prototype, "firstChild").get;
  next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
  if (is_extensible(element_prototype)) {
    element_prototype.__click = void 0;
    element_prototype.__className = void 0;
    element_prototype.__attributes = null;
    element_prototype.__style = void 0;
    element_prototype.__e = void 0;
  }
  if (is_extensible(text_prototype)) {
    text_prototype.__t = void 0;
  }
}
function create_text(value = "") {
  return document.createTextNode(value);
}
// @__NO_SIDE_EFFECTS__
function get_first_child(node) {
  return first_child_getter.call(node);
}
// @__NO_SIDE_EFFECTS__
function get_next_sibling(node) {
  return next_sibling_getter.call(node);
}
function child(node, is_text) {
  {
    return /* @__PURE__ */ get_first_child(node);
  }
}
function first_child(fragment, is_text = false) {
  {
    var first = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ get_first_child(
        /** @type {Node} */
        fragment
      )
    );
    if (first instanceof Comment && first.data === "") return /* @__PURE__ */ get_next_sibling(first);
    return first;
  }
}
function sibling(node, count = 1, is_text = false) {
  let next_sibling = node;
  while (count--) {
    next_sibling = /** @type {TemplateNode} */
    /* @__PURE__ */ get_next_sibling(next_sibling);
  }
  {
    return next_sibling;
  }
}
function clear_text_content(node) {
  node.textContent = "";
}
function should_defer_append() {
  return false;
}
let listening_to_form_reset = false;
function add_form_reset_listener() {
  if (!listening_to_form_reset) {
    listening_to_form_reset = true;
    document.addEventListener(
      "reset",
      (evt) => {
        Promise.resolve().then(() => {
          if (!evt.defaultPrevented) {
            for (
              const e of
              /**@type {HTMLFormElement} */
              evt.target.elements
            ) {
              e.__on_r?.();
            }
          }
        });
      },
      // In the capture phase to guarantee we get noticed of it (no possibility of stopPropagation)
      { capture: true }
    );
  }
}
function without_reactive_context(fn) {
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    return fn();
  } finally {
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}
function listen_to_event_and_reset_event(element, event2, handler, on_reset = handler) {
  element.addEventListener(event2, () => without_reactive_context(handler));
  const prev = element.__on_r;
  if (prev) {
    element.__on_r = () => {
      prev();
      on_reset(true);
    };
  } else {
    element.__on_r = () => on_reset(true);
  }
  add_form_reset_listener();
}
function validate_effect(rune) {
  if (active_effect === null) {
    if (active_reaction === null) {
      effect_orphan();
    }
    effect_in_unowned_derived();
  }
  if (is_destroying_effect) {
    effect_in_teardown();
  }
}
function push_effect(effect2, parent_effect) {
  var parent_last = parent_effect.last;
  if (parent_last === null) {
    parent_effect.last = parent_effect.first = effect2;
  } else {
    parent_last.next = effect2;
    effect2.prev = parent_last;
    parent_effect.last = effect2;
  }
}
function create_effect(type, fn, sync) {
  var parent = active_effect;
  if (parent !== null && (parent.f & INERT) !== 0) {
    type |= INERT;
  }
  var effect2 = {
    ctx: component_context,
    deps: null,
    nodes: null,
    f: type | DIRTY | CONNECTED,
    first: null,
    fn,
    last: null,
    next: null,
    parent,
    b: parent && parent.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  if (sync) {
    try {
      update_effect(effect2);
      effect2.f |= EFFECT_RAN;
    } catch (e2) {
      destroy_effect(effect2);
      throw e2;
    }
  } else if (fn !== null) {
    schedule_effect(effect2);
  }
  var e = effect2;
  if (sync && e.deps === null && e.teardown === null && e.nodes === null && e.first === e.last && // either `null`, or a singular child
  (e.f & EFFECT_PRESERVED) === 0) {
    e = e.first;
    if ((type & BLOCK_EFFECT) !== 0 && (type & EFFECT_TRANSPARENT) !== 0 && e !== null) {
      e.f |= EFFECT_TRANSPARENT;
    }
  }
  if (e !== null) {
    e.parent = parent;
    if (parent !== null) {
      push_effect(e, parent);
    }
    if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0 && (type & ROOT_EFFECT) === 0) {
      var derived2 = (
        /** @type {Derived} */
        active_reaction
      );
      (derived2.effects ??= []).push(e);
    }
  }
  return effect2;
}
function effect_tracking() {
  return active_reaction !== null && !untracking;
}
function teardown(fn) {
  const effect2 = create_effect(RENDER_EFFECT, null, false);
  set_signal_status(effect2, CLEAN);
  effect2.teardown = fn;
  return effect2;
}
function user_effect(fn) {
  validate_effect();
  var flags2 = (
    /** @type {Effect} */
    active_effect.f
  );
  var defer = !active_reaction && (flags2 & BRANCH_EFFECT) !== 0 && (flags2 & EFFECT_RAN) === 0;
  if (defer) {
    var context = (
      /** @type {ComponentContext} */
      component_context
    );
    (context.e ??= []).push(fn);
  } else {
    return create_user_effect(fn);
  }
}
function create_user_effect(fn) {
  return create_effect(EFFECT | USER_EFFECT, fn, false);
}
function component_root(fn) {
  Batch.ensure();
  const effect2 = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn, true);
  return (options = {}) => {
    return new Promise((fulfil) => {
      if (options.outro) {
        pause_effect(effect2, () => {
          destroy_effect(effect2);
          fulfil(void 0);
        });
      } else {
        destroy_effect(effect2);
        fulfil(void 0);
      }
    });
  };
}
function effect(fn) {
  return create_effect(EFFECT, fn, false);
}
function async_effect(fn) {
  return create_effect(ASYNC | EFFECT_PRESERVED, fn, true);
}
function render_effect(fn, flags2 = 0) {
  return create_effect(RENDER_EFFECT | flags2, fn, true);
}
function template_effect(fn, sync = [], async = [], blockers = []) {
  flatten(blockers, sync, async, (values) => {
    create_effect(RENDER_EFFECT, () => fn(...values.map(get)), true);
  });
}
function block(fn, flags2 = 0) {
  var effect2 = create_effect(BLOCK_EFFECT | flags2, fn, true);
  return effect2;
}
function branch(fn) {
  return create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, fn, true);
}
function execute_effect_teardown(effect2) {
  var teardown2 = effect2.teardown;
  if (teardown2 !== null) {
    const previously_destroying_effect = is_destroying_effect;
    const previous_reaction = active_reaction;
    set_is_destroying_effect(true);
    set_active_reaction(null);
    try {
      teardown2.call(null);
    } finally {
      set_is_destroying_effect(previously_destroying_effect);
      set_active_reaction(previous_reaction);
    }
  }
}
function destroy_effect_children(signal, remove_dom = false) {
  var effect2 = signal.first;
  signal.first = signal.last = null;
  while (effect2 !== null) {
    const controller = effect2.ac;
    if (controller !== null) {
      without_reactive_context(() => {
        controller.abort(STALE_REACTION);
      });
    }
    var next = effect2.next;
    if ((effect2.f & ROOT_EFFECT) !== 0) {
      effect2.parent = null;
    } else {
      destroy_effect(effect2, remove_dom);
    }
    effect2 = next;
  }
}
function destroy_block_effect_children(signal) {
  var effect2 = signal.first;
  while (effect2 !== null) {
    var next = effect2.next;
    if ((effect2.f & BRANCH_EFFECT) === 0) {
      destroy_effect(effect2);
    }
    effect2 = next;
  }
}
function destroy_effect(effect2, remove_dom = true) {
  var removed = false;
  if ((remove_dom || (effect2.f & HEAD_EFFECT) !== 0) && effect2.nodes !== null && effect2.nodes.end !== null) {
    remove_effect_dom(
      effect2.nodes.start,
      /** @type {TemplateNode} */
      effect2.nodes.end
    );
    removed = true;
  }
  destroy_effect_children(effect2, remove_dom && !removed);
  remove_reactions(effect2, 0);
  set_signal_status(effect2, DESTROYED);
  var transitions = effect2.nodes && effect2.nodes.t;
  if (transitions !== null) {
    for (const transition2 of transitions) {
      transition2.stop();
    }
  }
  execute_effect_teardown(effect2);
  var parent = effect2.parent;
  if (parent !== null && parent.first !== null) {
    unlink_effect(effect2);
  }
  effect2.next = effect2.prev = effect2.teardown = effect2.ctx = effect2.deps = effect2.fn = effect2.nodes = effect2.ac = null;
}
function remove_effect_dom(node, end) {
  while (node !== null) {
    var next = node === end ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(node)
    );
    node.remove();
    node = next;
  }
}
function unlink_effect(effect2) {
  var parent = effect2.parent;
  var prev = effect2.prev;
  var next = effect2.next;
  if (prev !== null) prev.next = next;
  if (next !== null) next.prev = prev;
  if (parent !== null) {
    if (parent.first === effect2) parent.first = next;
    if (parent.last === effect2) parent.last = prev;
  }
}
function pause_effect(effect2, callback, destroy = true) {
  var transitions = [];
  pause_children(effect2, transitions, true);
  run_out_transitions(transitions, () => {
    if (destroy) destroy_effect(effect2);
    if (callback) callback();
  });
}
function run_out_transitions(transitions, fn) {
  var remaining = transitions.length;
  if (remaining > 0) {
    var check = () => --remaining || fn();
    for (var transition2 of transitions) {
      transition2.out(check);
    }
  } else {
    fn();
  }
}
function pause_children(effect2, transitions, local) {
  if ((effect2.f & INERT) !== 0) return;
  effect2.f ^= INERT;
  var t = effect2.nodes && effect2.nodes.t;
  if (t !== null) {
    for (const transition2 of t) {
      if (transition2.is_global || local) {
        transitions.push(transition2);
      }
    }
  }
  var child2 = effect2.first;
  while (child2 !== null) {
    var sibling2 = child2.next;
    var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || // If this is a branch effect without a block effect parent,
    // it means the parent block effect was pruned. In that case,
    // transparency information was transferred to the branch effect.
    (child2.f & BRANCH_EFFECT) !== 0 && (effect2.f & BLOCK_EFFECT) !== 0;
    pause_children(child2, transitions, transparent ? local : false);
    child2 = sibling2;
  }
}
function resume_effect(effect2) {
  resume_children(effect2, true);
}
function resume_children(effect2, local) {
  if ((effect2.f & INERT) === 0) return;
  effect2.f ^= INERT;
  if ((effect2.f & CLEAN) === 0) {
    set_signal_status(effect2, DIRTY);
    schedule_effect(effect2);
  }
  var child2 = effect2.first;
  while (child2 !== null) {
    var sibling2 = child2.next;
    var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
    resume_children(child2, transparent ? local : false);
    child2 = sibling2;
  }
  var t = effect2.nodes && effect2.nodes.t;
  if (t !== null) {
    for (const transition2 of t) {
      if (transition2.is_global || local) {
        transition2.in();
      }
    }
  }
}
function move_effect(effect2, fragment) {
  if (!effect2.nodes) return;
  var node = effect2.nodes.start;
  var end = effect2.nodes.end;
  while (node !== null) {
    var next = node === end ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(node)
    );
    fragment.append(node);
    node = next;
  }
}
let is_updating_effect = false;
function set_is_updating_effect(value) {
  is_updating_effect = value;
}
let is_destroying_effect = false;
function set_is_destroying_effect(value) {
  is_destroying_effect = value;
}
let active_reaction = null;
let untracking = false;
function set_active_reaction(reaction) {
  active_reaction = reaction;
}
let active_effect = null;
function set_active_effect(effect2) {
  active_effect = effect2;
}
let current_sources = null;
function push_reaction_value(value) {
  if (active_reaction !== null && true) {
    if (current_sources === null) {
      current_sources = [value];
    } else {
      current_sources.push(value);
    }
  }
}
let new_deps = null;
let skipped_deps = 0;
let untracked_writes = null;
function set_untracked_writes(value) {
  untracked_writes = value;
}
let write_version = 1;
let read_version = 0;
let update_version = read_version;
function set_update_version(value) {
  update_version = value;
}
function increment_write_version() {
  return ++write_version;
}
function is_dirty(reaction) {
  var flags2 = reaction.f;
  if ((flags2 & DIRTY) !== 0) {
    return true;
  }
  if (flags2 & DERIVED) {
    reaction.f &= ~WAS_MARKED;
  }
  if ((flags2 & MAYBE_DIRTY) !== 0) {
    var dependencies = reaction.deps;
    if (dependencies !== null) {
      var length = dependencies.length;
      for (var i = 0; i < length; i++) {
        var dependency = dependencies[i];
        if (is_dirty(
          /** @type {Derived} */
          dependency
        )) {
          update_derived(
            /** @type {Derived} */
            dependency
          );
        }
        if (dependency.wv > reaction.wv) {
          return true;
        }
      }
    }
    if ((flags2 & CONNECTED) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    batch_values === null) {
      set_signal_status(reaction, CLEAN);
    }
  }
  return false;
}
function schedule_possible_effect_self_invalidation(signal, effect2, root2 = true) {
  var reactions = signal.reactions;
  if (reactions === null) return;
  if (current_sources?.includes(signal)) {
    return;
  }
  for (var i = 0; i < reactions.length; i++) {
    var reaction = reactions[i];
    if ((reaction.f & DERIVED) !== 0) {
      schedule_possible_effect_self_invalidation(
        /** @type {Derived} */
        reaction,
        effect2,
        false
      );
    } else if (effect2 === reaction) {
      if (root2) {
        set_signal_status(reaction, DIRTY);
      } else if ((reaction.f & CLEAN) !== 0) {
        set_signal_status(reaction, MAYBE_DIRTY);
      }
      schedule_effect(
        /** @type {Effect} */
        reaction
      );
    }
  }
}
function update_reaction(reaction) {
  var previous_deps = new_deps;
  var previous_skipped_deps = skipped_deps;
  var previous_untracked_writes = untracked_writes;
  var previous_reaction = active_reaction;
  var previous_sources = current_sources;
  var previous_component_context = component_context;
  var previous_untracking = untracking;
  var previous_update_version = update_version;
  var flags2 = reaction.f;
  new_deps = /** @type {null | Value[]} */
  null;
  skipped_deps = 0;
  untracked_writes = null;
  active_reaction = (flags2 & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
  current_sources = null;
  set_component_context(reaction.ctx);
  untracking = false;
  update_version = ++read_version;
  if (reaction.ac !== null) {
    without_reactive_context(() => {
      reaction.ac.abort(STALE_REACTION);
    });
    reaction.ac = null;
  }
  try {
    reaction.f |= REACTION_IS_UPDATING;
    var fn = (
      /** @type {Function} */
      reaction.fn
    );
    var result = fn();
    var deps = reaction.deps;
    if (new_deps !== null) {
      var i;
      remove_reactions(reaction, skipped_deps);
      if (deps !== null && skipped_deps > 0) {
        deps.length = skipped_deps + new_deps.length;
        for (i = 0; i < new_deps.length; i++) {
          deps[skipped_deps + i] = new_deps[i];
        }
      } else {
        reaction.deps = deps = new_deps;
      }
      if (effect_tracking() && (reaction.f & CONNECTED) !== 0) {
        for (i = skipped_deps; i < deps.length; i++) {
          (deps[i].reactions ??= []).push(reaction);
        }
      }
    } else if (deps !== null && skipped_deps < deps.length) {
      remove_reactions(reaction, skipped_deps);
      deps.length = skipped_deps;
    }
    if (is_runes() && untracked_writes !== null && !untracking && deps !== null && (reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0) {
      for (i = 0; i < /** @type {Source[]} */
      untracked_writes.length; i++) {
        schedule_possible_effect_self_invalidation(
          untracked_writes[i],
          /** @type {Effect} */
          reaction
        );
      }
    }
    if (previous_reaction !== null && previous_reaction !== reaction) {
      read_version++;
      if (untracked_writes !== null) {
        if (previous_untracked_writes === null) {
          previous_untracked_writes = untracked_writes;
        } else {
          previous_untracked_writes.push(.../** @type {Source[]} */
          untracked_writes);
        }
      }
    }
    if ((reaction.f & ERROR_VALUE) !== 0) {
      reaction.f ^= ERROR_VALUE;
    }
    return result;
  } catch (error) {
    return handle_error(error);
  } finally {
    reaction.f ^= REACTION_IS_UPDATING;
    new_deps = previous_deps;
    skipped_deps = previous_skipped_deps;
    untracked_writes = previous_untracked_writes;
    active_reaction = previous_reaction;
    current_sources = previous_sources;
    set_component_context(previous_component_context);
    untracking = previous_untracking;
    update_version = previous_update_version;
  }
}
function remove_reaction(signal, dependency) {
  let reactions = dependency.reactions;
  if (reactions !== null) {
    var index2 = index_of.call(reactions, signal);
    if (index2 !== -1) {
      var new_length = reactions.length - 1;
      if (new_length === 0) {
        reactions = dependency.reactions = null;
      } else {
        reactions[index2] = reactions[new_length];
        reactions.pop();
      }
    }
  }
  if (reactions === null && (dependency.f & DERIVED) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (new_deps === null || !new_deps.includes(dependency))) {
    set_signal_status(dependency, MAYBE_DIRTY);
    if ((dependency.f & CONNECTED) !== 0) {
      dependency.f ^= CONNECTED;
      dependency.f &= ~WAS_MARKED;
    }
    destroy_derived_effects(
      /** @type {Derived} **/
      dependency
    );
    remove_reactions(
      /** @type {Derived} **/
      dependency,
      0
    );
  }
}
function remove_reactions(signal, start_index) {
  var dependencies = signal.deps;
  if (dependencies === null) return;
  for (var i = start_index; i < dependencies.length; i++) {
    remove_reaction(signal, dependencies[i]);
  }
}
function update_effect(effect2) {
  var flags2 = effect2.f;
  if ((flags2 & DESTROYED) !== 0) {
    return;
  }
  set_signal_status(effect2, CLEAN);
  var previous_effect = active_effect;
  var was_updating_effect = is_updating_effect;
  active_effect = effect2;
  is_updating_effect = true;
  try {
    if ((flags2 & (BLOCK_EFFECT | MANAGED_EFFECT)) !== 0) {
      destroy_block_effect_children(effect2);
    } else {
      destroy_effect_children(effect2);
    }
    execute_effect_teardown(effect2);
    var teardown2 = update_reaction(effect2);
    effect2.teardown = typeof teardown2 === "function" ? teardown2 : null;
    effect2.wv = write_version;
    var dep;
    if (DEV && tracing_mode_flag && (effect2.f & DIRTY) !== 0 && effect2.deps !== null) ;
  } finally {
    is_updating_effect = was_updating_effect;
    active_effect = previous_effect;
  }
}
async function tick() {
  await Promise.resolve();
  flushSync();
}
function get(signal) {
  var flags2 = signal.f;
  var is_derived = (flags2 & DERIVED) !== 0;
  if (active_reaction !== null && !untracking) {
    var destroyed = active_effect !== null && (active_effect.f & DESTROYED) !== 0;
    if (!destroyed && !current_sources?.includes(signal)) {
      var deps = active_reaction.deps;
      if ((active_reaction.f & REACTION_IS_UPDATING) !== 0) {
        if (signal.rv < read_version) {
          signal.rv = read_version;
          if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
            skipped_deps++;
          } else if (new_deps === null) {
            new_deps = [signal];
          } else if (!new_deps.includes(signal)) {
            new_deps.push(signal);
          }
        }
      } else {
        (active_reaction.deps ??= []).push(signal);
        var reactions = signal.reactions;
        if (reactions === null) {
          signal.reactions = [active_reaction];
        } else if (!reactions.includes(active_reaction)) {
          reactions.push(active_reaction);
        }
      }
    }
  }
  if (is_destroying_effect) {
    if (old_values.has(signal)) {
      return old_values.get(signal);
    }
    if (is_derived) {
      var derived2 = (
        /** @type {Derived} */
        signal
      );
      var value = derived2.v;
      if ((derived2.f & CLEAN) === 0 && derived2.reactions !== null || depends_on_old_values(derived2)) {
        value = execute_derived(derived2);
      }
      old_values.set(derived2, value);
      return value;
    }
  } else if (is_derived && (!batch_values?.has(signal) || current_batch?.is_fork && !effect_tracking())) {
    derived2 = /** @type {Derived} */
    signal;
    if (is_dirty(derived2)) {
      update_derived(derived2);
    }
    if (is_updating_effect && effect_tracking() && (derived2.f & CONNECTED) === 0) {
      reconnect(derived2);
    }
  }
  if (batch_values?.has(signal)) {
    return batch_values.get(signal);
  }
  if ((signal.f & ERROR_VALUE) !== 0) {
    throw signal.v;
  }
  return signal.v;
}
function reconnect(derived2) {
  if (derived2.deps === null) return;
  derived2.f ^= CONNECTED;
  for (const dep of derived2.deps) {
    (dep.reactions ??= []).push(derived2);
    if ((dep.f & DERIVED) !== 0 && (dep.f & CONNECTED) === 0) {
      reconnect(
        /** @type {Derived} */
        dep
      );
    }
  }
}
function depends_on_old_values(derived2) {
  if (derived2.v === UNINITIALIZED) return true;
  if (derived2.deps === null) return false;
  for (const dep of derived2.deps) {
    if (old_values.has(dep)) {
      return true;
    }
    if ((dep.f & DERIVED) !== 0 && depends_on_old_values(
      /** @type {Derived} */
      dep
    )) {
      return true;
    }
  }
  return false;
}
function untrack(fn) {
  var previous_untracking = untracking;
  try {
    untracking = true;
    return fn();
  } finally {
    untracking = previous_untracking;
  }
}
const STATUS_MASK = -7169;
function set_signal_status(signal, status) {
  signal.f = signal.f & STATUS_MASK | status;
}
const PASSIVE_EVENTS = ["touchstart", "touchmove"];
function is_passive_event(name) {
  return PASSIVE_EVENTS.includes(name);
}
const all_registered_events = /* @__PURE__ */ new Set();
const root_event_handles = /* @__PURE__ */ new Set();
function create_event(event_name, dom, handler, options = {}) {
  function target_handler(event2) {
    if (!options.capture) {
      handle_event_propagation.call(dom, event2);
    }
    if (!event2.cancelBubble) {
      return without_reactive_context(() => {
        return handler?.call(this, event2);
      });
    }
  }
  if (event_name.startsWith("pointer") || event_name.startsWith("touch") || event_name === "wheel") {
    queue_micro_task(() => {
      dom.addEventListener(event_name, target_handler, options);
    });
  } else {
    dom.addEventListener(event_name, target_handler, options);
  }
  return target_handler;
}
function event(event_name, dom, handler, capture2, passive) {
  var options = { capture: capture2, passive };
  var target_handler = create_event(event_name, dom, handler, options);
  if (dom === document.body || // @ts-ignore
  dom === window || // @ts-ignore
  dom === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  dom instanceof HTMLMediaElement) {
    teardown(() => {
      dom.removeEventListener(event_name, target_handler, options);
    });
  }
}
function delegate(events) {
  for (var i = 0; i < events.length; i++) {
    all_registered_events.add(events[i]);
  }
  for (var fn of root_event_handles) {
    fn(events);
  }
}
let last_propagated_event = null;
function handle_event_propagation(event2) {
  var handler_element = this;
  var owner_document = (
    /** @type {Node} */
    handler_element.ownerDocument
  );
  var event_name = event2.type;
  var path = event2.composedPath?.() || [];
  var current_target = (
    /** @type {null | Element} */
    path[0] || event2.target
  );
  last_propagated_event = event2;
  var path_idx = 0;
  var handled_at = last_propagated_event === event2 && event2.__root;
  if (handled_at) {
    var at_idx = path.indexOf(handled_at);
    if (at_idx !== -1 && (handler_element === document || handler_element === /** @type {any} */
    window)) {
      event2.__root = handler_element;
      return;
    }
    var handler_idx = path.indexOf(handler_element);
    if (handler_idx === -1) {
      return;
    }
    if (at_idx <= handler_idx) {
      path_idx = at_idx;
    }
  }
  current_target = /** @type {Element} */
  path[path_idx] || event2.target;
  if (current_target === handler_element) return;
  define_property(event2, "currentTarget", {
    configurable: true,
    get() {
      return current_target || owner_document;
    }
  });
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    var throw_error;
    var other_errors = [];
    while (current_target !== null) {
      var parent_element = current_target.assignedSlot || current_target.parentNode || /** @type {any} */
      current_target.host || null;
      try {
        var delegated = current_target["__" + event_name];
        if (delegated != null && (!/** @type {any} */
        current_target.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
        // -> the target could not have been disabled because it emits the event in the first place
        event2.target === current_target)) {
          delegated.call(current_target, event2);
        }
      } catch (error) {
        if (throw_error) {
          other_errors.push(error);
        } else {
          throw_error = error;
        }
      }
      if (event2.cancelBubble || parent_element === handler_element || parent_element === null) {
        break;
      }
      current_target = parent_element;
    }
    if (throw_error) {
      for (let error of other_errors) {
        queueMicrotask(() => {
          throw error;
        });
      }
      throw throw_error;
    }
  } finally {
    event2.__root = handler_element;
    delete event2.currentTarget;
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}
function create_fragment_from_html(html) {
  var elem = document.createElement("template");
  elem.innerHTML = html.replaceAll("<!>", "<!---->");
  return elem.content;
}
function assign_nodes(start, end) {
  var effect2 = (
    /** @type {Effect} */
    active_effect
  );
  if (effect2.nodes === null) {
    effect2.nodes = { start, end, a: null, t: null };
  }
}
// @__NO_SIDE_EFFECTS__
function from_html(content, flags2) {
  var is_fragment = (flags2 & TEMPLATE_FRAGMENT) !== 0;
  var use_import_node = (flags2 & TEMPLATE_USE_IMPORT_NODE) !== 0;
  var node;
  var has_start = !content.startsWith("<!>");
  return () => {
    if (node === void 0) {
      node = create_fragment_from_html(has_start ? content : "<!>" + content);
      if (!is_fragment) node = /** @type {Node} */
      /* @__PURE__ */ get_first_child(node);
    }
    var clone = (
      /** @type {TemplateNode} */
      use_import_node || is_firefox ? document.importNode(node, true) : node.cloneNode(true)
    );
    if (is_fragment) {
      var start = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(clone)
      );
      var end = (
        /** @type {TemplateNode} */
        clone.lastChild
      );
      assign_nodes(start, end);
    } else {
      assign_nodes(clone, clone);
    }
    return clone;
  };
}
// @__NO_SIDE_EFFECTS__
function from_namespace(content, flags2, ns = "svg") {
  var has_start = !content.startsWith("<!>");
  var is_fragment = (flags2 & TEMPLATE_FRAGMENT) !== 0;
  var wrapped = `<${ns}>${has_start ? content : "<!>" + content}</${ns}>`;
  var node;
  return () => {
    if (!node) {
      var fragment = (
        /** @type {DocumentFragment} */
        create_fragment_from_html(wrapped)
      );
      var root2 = (
        /** @type {Element} */
        /* @__PURE__ */ get_first_child(fragment)
      );
      if (is_fragment) {
        node = document.createDocumentFragment();
        while (/* @__PURE__ */ get_first_child(root2)) {
          node.appendChild(
            /** @type {Node} */
            /* @__PURE__ */ get_first_child(root2)
          );
        }
      } else {
        node = /** @type {Element} */
        /* @__PURE__ */ get_first_child(root2);
      }
    }
    var clone = (
      /** @type {TemplateNode} */
      node.cloneNode(true)
    );
    if (is_fragment) {
      var start = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(clone)
      );
      var end = (
        /** @type {TemplateNode} */
        clone.lastChild
      );
      assign_nodes(start, end);
    } else {
      assign_nodes(clone, clone);
    }
    return clone;
  };
}
// @__NO_SIDE_EFFECTS__
function from_svg(content, flags2) {
  return /* @__PURE__ */ from_namespace(content, flags2, "svg");
}
function text(value = "") {
  {
    var t = create_text(value + "");
    assign_nodes(t, t);
    return t;
  }
}
function comment() {
  var frag = document.createDocumentFragment();
  var start = document.createComment("");
  var anchor = create_text();
  frag.append(start, anchor);
  assign_nodes(start, anchor);
  return frag;
}
function append(anchor, dom) {
  if (anchor === null) {
    return;
  }
  anchor.before(
    /** @type {Node} */
    dom
  );
}
let should_intro = true;
function set_text(text2, value) {
  var str = value == null ? "" : typeof value === "object" ? value + "" : value;
  if (str !== (text2.__t ??= text2.nodeValue)) {
    text2.__t = str;
    text2.nodeValue = str + "";
  }
}
function mount(component, options) {
  return _mount(component, options);
}
const document_listeners = /* @__PURE__ */ new Map();
function _mount(Component, { target, anchor, props = {}, events, context, intro = true }) {
  init_operations();
  var registered_events = /* @__PURE__ */ new Set();
  var event_handle = (events2) => {
    for (var i = 0; i < events2.length; i++) {
      var event_name = events2[i];
      if (registered_events.has(event_name)) continue;
      registered_events.add(event_name);
      var passive = is_passive_event(event_name);
      target.addEventListener(event_name, handle_event_propagation, { passive });
      var n = document_listeners.get(event_name);
      if (n === void 0) {
        document.addEventListener(event_name, handle_event_propagation, { passive });
        document_listeners.set(event_name, 1);
      } else {
        document_listeners.set(event_name, n + 1);
      }
    }
  };
  event_handle(array_from(all_registered_events));
  root_event_handles.add(event_handle);
  var component = void 0;
  var unmount = component_root(() => {
    var anchor_node = anchor ?? target.appendChild(create_text());
    boundary(
      /** @type {TemplateNode} */
      anchor_node,
      {
        pending: () => {
        }
      },
      (anchor_node2) => {
        if (context) {
          push({});
          var ctx = (
            /** @type {ComponentContext} */
            component_context
          );
          ctx.c = context;
        }
        if (events) {
          props.$$events = events;
        }
        should_intro = intro;
        component = Component(anchor_node2, props) || {};
        should_intro = true;
        if (context) {
          pop();
        }
      }
    );
    return () => {
      for (var event_name of registered_events) {
        target.removeEventListener(event_name, handle_event_propagation);
        var n = (
          /** @type {number} */
          document_listeners.get(event_name)
        );
        if (--n === 0) {
          document.removeEventListener(event_name, handle_event_propagation);
          document_listeners.delete(event_name);
        } else {
          document_listeners.set(event_name, n);
        }
      }
      root_event_handles.delete(event_handle);
      if (anchor_node !== anchor) {
        anchor_node.parentNode?.removeChild(anchor_node);
      }
    };
  });
  mounted_components.set(component, unmount);
  return component;
}
let mounted_components = /* @__PURE__ */ new WeakMap();
class BranchManager {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #batches = /* @__PURE__ */ new Map();
  /**
   * Map of keys to effects that are currently rendered in the DOM.
   * These effects are visible and actively part of the document tree.
   * Example:
   * ```
   * {#if condition}
   * 	foo
   * {:else}
   * 	bar
   * {/if}
   * ```
   * Can result in the entries `true->Effect` and `false->Effect`
   * @type {Map<Key, Effect>}
   */
  #onscreen = /* @__PURE__ */ new Map();
  /**
   * Similar to #onscreen with respect to the keys, but contains branches that are not yet
   * in the DOM, because their insertion is deferred.
   * @type {Map<Key, Branch>}
   */
  #offscreen = /* @__PURE__ */ new Map();
  /**
   * Keys of effects that are currently outroing
   * @type {Set<Key>}
   */
  #outroing = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #transition = true;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(anchor, transition2 = true) {
    this.anchor = anchor;
    this.#transition = transition2;
  }
  #commit = () => {
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    if (!this.#batches.has(batch)) return;
    var key = (
      /** @type {Key} */
      this.#batches.get(batch)
    );
    var onscreen = this.#onscreen.get(key);
    if (onscreen) {
      resume_effect(onscreen);
      this.#outroing.delete(key);
    } else {
      var offscreen = this.#offscreen.get(key);
      if (offscreen) {
        this.#onscreen.set(key, offscreen.effect);
        this.#offscreen.delete(key);
        offscreen.fragment.lastChild.remove();
        this.anchor.before(offscreen.fragment);
        onscreen = offscreen.effect;
      }
    }
    for (const [b, k] of this.#batches) {
      this.#batches.delete(b);
      if (b === batch) {
        break;
      }
      const offscreen2 = this.#offscreen.get(k);
      if (offscreen2) {
        destroy_effect(offscreen2.effect);
        this.#offscreen.delete(k);
      }
    }
    for (const [k, effect2] of this.#onscreen) {
      if (k === key || this.#outroing.has(k)) continue;
      const on_destroy = () => {
        const keys = Array.from(this.#batches.values());
        if (keys.includes(k)) {
          var fragment = document.createDocumentFragment();
          move_effect(effect2, fragment);
          fragment.append(create_text());
          this.#offscreen.set(k, { effect: effect2, fragment });
        } else {
          destroy_effect(effect2);
        }
        this.#outroing.delete(k);
        this.#onscreen.delete(k);
      };
      if (this.#transition || !onscreen) {
        this.#outroing.add(k);
        pause_effect(effect2, on_destroy, false);
      } else {
        on_destroy();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #discard = (batch) => {
    this.#batches.delete(batch);
    const keys = Array.from(this.#batches.values());
    for (const [k, branch2] of this.#offscreen) {
      if (!keys.includes(k)) {
        destroy_effect(branch2.effect);
        this.#offscreen.delete(k);
      }
    }
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(key, fn) {
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    var defer = should_defer_append();
    if (fn && !this.#onscreen.has(key) && !this.#offscreen.has(key)) {
      if (defer) {
        var fragment = document.createDocumentFragment();
        var target = create_text();
        fragment.append(target);
        this.#offscreen.set(key, {
          effect: branch(() => fn(target)),
          fragment
        });
      } else {
        this.#onscreen.set(
          key,
          branch(() => fn(this.anchor))
        );
      }
    }
    this.#batches.set(batch, key);
    if (defer) {
      for (const [k, effect2] of this.#onscreen) {
        if (k === key) {
          batch.skipped_effects.delete(effect2);
        } else {
          batch.skipped_effects.add(effect2);
        }
      }
      for (const [k, branch2] of this.#offscreen) {
        if (k === key) {
          batch.skipped_effects.delete(branch2.effect);
        } else {
          batch.skipped_effects.add(branch2.effect);
        }
      }
      batch.oncommit(this.#commit);
      batch.ondiscard(this.#discard);
    } else {
      this.#commit();
    }
  }
}
function if_block(node, fn, elseif = false) {
  var branches = new BranchManager(node);
  var flags2 = elseif ? EFFECT_TRANSPARENT : 0;
  function update_branch(condition, fn2) {
    branches.ensure(condition, fn2);
  }
  block(() => {
    var has_branch = false;
    fn((fn2, flag = true) => {
      has_branch = true;
      update_branch(flag, fn2);
    });
    if (!has_branch) {
      update_branch(false, null);
    }
  }, flags2);
}
function index(_, i) {
  return i;
}
function pause_effects(state2, to_destroy, controlled_anchor) {
  var transitions = [];
  var length = to_destroy.length;
  for (var i = 0; i < length; i++) {
    pause_children(to_destroy[i].e, transitions, true);
  }
  run_out_transitions(transitions, () => {
    var fast_path = transitions.length === 0 && controlled_anchor !== null;
    if (fast_path) {
      var anchor = (
        /** @type {Element} */
        controlled_anchor
      );
      var parent_node = (
        /** @type {Element} */
        anchor.parentNode
      );
      clear_text_content(parent_node);
      parent_node.append(anchor);
      state2.items.clear();
      link(state2, to_destroy[0].prev, to_destroy[length - 1].next);
    }
    for (var i2 = 0; i2 < length; i2++) {
      var item = to_destroy[i2];
      if (!fast_path) {
        state2.items.delete(item.k);
        link(state2, item.prev, item.next);
      }
      destroy_effect(item.e, !fast_path);
    }
    if (state2.first === to_destroy[0]) {
      state2.first = to_destroy[0].prev;
    }
  });
}
function each(node, flags2, get_collection, get_key, render_fn, fallback_fn = null) {
  var anchor = node;
  var items = /* @__PURE__ */ new Map();
  var first = null;
  var is_controlled = (flags2 & EACH_IS_CONTROLLED) !== 0;
  var is_reactive_value = (flags2 & EACH_ITEM_REACTIVE) !== 0;
  var is_reactive_index = (flags2 & EACH_INDEX_REACTIVE) !== 0;
  if (is_controlled) {
    var parent_node = (
      /** @type {Element} */
      node
    );
    anchor = parent_node.appendChild(create_text());
  }
  var fallback = null;
  var each_array = /* @__PURE__ */ derived_safe_equal(() => {
    var collection = get_collection();
    return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
  });
  var array;
  var first_run = true;
  function commit() {
    reconcile(state2, array, anchor, flags2, get_key);
    if (fallback !== null) {
      if (array.length === 0) {
        if (fallback.fragment) {
          anchor.before(fallback.fragment);
          fallback.fragment = null;
        } else {
          resume_effect(fallback.effect);
        }
        effect2.first = fallback.effect;
      } else {
        pause_effect(fallback.effect, () => {
          fallback = null;
        });
      }
    }
  }
  var effect2 = block(() => {
    array = /** @type {V[]} */
    get(each_array);
    var length = array.length;
    var keys = /* @__PURE__ */ new Set();
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    var prev = null;
    var defer = should_defer_append();
    for (var i = 0; i < length; i += 1) {
      var value = array[i];
      var key = get_key(value, i);
      var item = first_run ? null : items.get(key);
      if (item) {
        if (is_reactive_value) {
          internal_set(item.v, value);
        }
        if (is_reactive_index) {
          internal_set(
            /** @type {Value<number>} */
            item.i,
            i
          );
        }
        if (defer) {
          batch.skipped_effects.delete(item.e);
        }
      } else {
        item = create_item(
          first_run ? anchor : null,
          prev,
          value,
          key,
          i,
          render_fn,
          flags2,
          get_collection
        );
        if (first_run) {
          item.o = true;
          if (prev === null) {
            first = item;
          } else {
            prev.next = item;
          }
          prev = item;
        }
        items.set(key, item);
      }
      keys.add(key);
    }
    if (length === 0 && fallback_fn && !fallback) {
      if (first_run) {
        fallback = {
          fragment: null,
          effect: branch(() => fallback_fn(anchor))
        };
      } else {
        var fragment = document.createDocumentFragment();
        var target = create_text();
        fragment.append(target);
        fallback = {
          fragment,
          effect: branch(() => fallback_fn(target))
        };
      }
    }
    if (!first_run) {
      if (defer) {
        for (const [key2, item2] of items) {
          if (!keys.has(key2)) {
            batch.skipped_effects.add(item2.e);
          }
        }
        batch.oncommit(commit);
        batch.ondiscard(() => {
        });
      } else {
        commit();
      }
    }
    get(each_array);
  });
  var state2 = { effect: effect2, items, first };
  first_run = false;
}
function reconcile(state2, array, anchor, flags2, get_key) {
  var is_animated = (flags2 & EACH_IS_ANIMATED) !== 0;
  var length = array.length;
  var items = state2.items;
  var current = state2.first;
  var seen;
  var prev = null;
  var to_animate;
  var matched = [];
  var stashed = [];
  var value;
  var key;
  var item;
  var i;
  if (is_animated) {
    for (i = 0; i < length; i += 1) {
      value = array[i];
      key = get_key(value, i);
      item = /** @type {EachItem} */
      items.get(key);
      if (item.o) {
        item.e.nodes?.a?.measure();
        (to_animate ??= /* @__PURE__ */ new Set()).add(item);
      }
    }
  }
  for (i = 0; i < length; i += 1) {
    value = array[i];
    key = get_key(value, i);
    item = /** @type {EachItem} */
    items.get(key);
    state2.first ??= item;
    if (!item.o) {
      item.o = true;
      var next = prev ? prev.next : current;
      link(state2, prev, item);
      link(state2, item, next);
      move(item, next, anchor);
      prev = item;
      matched = [];
      stashed = [];
      current = prev.next;
      continue;
    }
    if ((item.e.f & INERT) !== 0) {
      resume_effect(item.e);
      if (is_animated) {
        item.e.nodes?.a?.unfix();
        (to_animate ??= /* @__PURE__ */ new Set()).delete(item);
      }
    }
    if (item !== current) {
      if (seen !== void 0 && seen.has(item)) {
        if (matched.length < stashed.length) {
          var start = stashed[0];
          var j;
          prev = start.prev;
          var a = matched[0];
          var b = matched[matched.length - 1];
          for (j = 0; j < matched.length; j += 1) {
            move(matched[j], start, anchor);
          }
          for (j = 0; j < stashed.length; j += 1) {
            seen.delete(stashed[j]);
          }
          link(state2, a.prev, b.next);
          link(state2, prev, a);
          link(state2, b, start);
          current = start;
          prev = b;
          i -= 1;
          matched = [];
          stashed = [];
        } else {
          seen.delete(item);
          move(item, current, anchor);
          link(state2, item.prev, item.next);
          link(state2, item, prev === null ? state2.first : prev.next);
          link(state2, prev, item);
          prev = item;
        }
        continue;
      }
      matched = [];
      stashed = [];
      while (current !== null && current !== item) {
        if ((current.e.f & INERT) === 0) {
          (seen ??= /* @__PURE__ */ new Set()).add(current);
        }
        stashed.push(current);
        current = current.next;
      }
      if (current === null) {
        continue;
      }
      item = current;
    }
    matched.push(item);
    prev = item;
    current = item.next;
  }
  let has_offscreen_items = items.size > length;
  if (current !== null || seen !== void 0) {
    var to_destroy = seen === void 0 ? [] : array_from(seen);
    while (current !== null) {
      if ((current.e.f & INERT) === 0) {
        to_destroy.push(current);
      }
      current = current.next;
    }
    var destroy_length = to_destroy.length;
    has_offscreen_items = items.size - destroy_length > length;
    if (destroy_length > 0) {
      var controlled_anchor = (flags2 & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;
      if (is_animated) {
        for (i = 0; i < destroy_length; i += 1) {
          to_destroy[i].e.nodes?.a?.measure();
        }
        for (i = 0; i < destroy_length; i += 1) {
          to_destroy[i].e.nodes?.a?.fix();
        }
      }
      pause_effects(state2, to_destroy, controlled_anchor);
    }
  }
  if (has_offscreen_items) {
    for (const item2 of items.values()) {
      if (!item2.o) {
        link(state2, prev, item2);
        prev = item2;
      }
    }
  }
  state2.effect.last = prev && prev.e;
  if (is_animated) {
    queue_micro_task(() => {
      if (to_animate === void 0) return;
      for (item of to_animate) {
        item.e.nodes?.a?.apply();
      }
    });
  }
}
function create_item(anchor, prev, value, key, index2, render_fn, flags2, get_collection) {
  var reactive = (flags2 & EACH_ITEM_REACTIVE) !== 0;
  var mutable = (flags2 & EACH_ITEM_IMMUTABLE) === 0;
  var v = reactive ? mutable ? /* @__PURE__ */ mutable_source(value, false, false) : source(value) : value;
  var i = (flags2 & EACH_INDEX_REACTIVE) === 0 ? index2 : source(index2);
  var item = {
    i,
    v,
    k: key,
    // @ts-expect-error
    e: null,
    o: false,
    prev,
    next: null
  };
  if (anchor === null) {
    var fragment = document.createDocumentFragment();
    fragment.append(anchor = create_text());
  }
  item.e = branch(() => render_fn(
    /** @type {Node} */
    anchor,
    v,
    i,
    get_collection
  ));
  if (prev !== null) {
    prev.next = item;
  }
  return item;
}
function move(item, next, anchor) {
  if (!item.e.nodes) return;
  var end = item.next ? (
    /** @type {EffectNodes} */
    item.next.e.nodes.start
  ) : anchor;
  var dest = next ? (
    /** @type {EffectNodes} */
    next.e.nodes.start
  ) : anchor;
  var node = (
    /** @type {TemplateNode} */
    item.e.nodes.start
  );
  while (node !== null && node !== end) {
    var next_node = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(node)
    );
    dest.before(node);
    node = next_node;
  }
}
function link(state2, prev, next) {
  if (prev === null) {
    state2.first = next;
    state2.effect.first = next && next.e;
  } else {
    if (prev.e.next) {
      prev.e.next.prev = null;
    }
    prev.next = next;
    prev.e.next = next && next.e;
  }
  if (next !== null) {
    if (next.e.prev) {
      next.e.prev.next = null;
    }
    next.prev = prev;
    next.e.prev = prev && prev.e;
  }
}
function snippet(node, get_snippet, ...args) {
  var branches = new BranchManager(node);
  block(() => {
    const snippet2 = get_snippet() ?? null;
    branches.ensure(snippet2, snippet2 && ((anchor) => snippet2(anchor, ...args)));
  }, EFFECT_TRANSPARENT);
}
const now = () => performance.now();
const raf = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (_) => requestAnimationFrame(_)
  ),
  now: () => now(),
  tasks: /* @__PURE__ */ new Set()
};
function run_tasks() {
  const now2 = raf.now();
  raf.tasks.forEach((task) => {
    if (!task.c(now2)) {
      raf.tasks.delete(task);
      task.f();
    }
  });
  if (raf.tasks.size !== 0) {
    raf.tick(run_tasks);
  }
}
function loop(callback) {
  let task;
  if (raf.tasks.size === 0) {
    raf.tick(run_tasks);
  }
  return {
    promise: new Promise((fulfill) => {
      raf.tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      raf.tasks.delete(task);
    }
  };
}
function dispatch_event(element, type) {
  without_reactive_context(() => {
    element.dispatchEvent(new CustomEvent(type));
  });
}
function css_property_to_camelcase(style) {
  if (style === "float") return "cssFloat";
  if (style === "offset") return "cssOffset";
  if (style.startsWith("--")) return style;
  const parts = style.split("-");
  if (parts.length === 1) return parts[0];
  return parts[0] + parts.slice(1).map(
    /** @param {any} word */
    (word) => word[0].toUpperCase() + word.slice(1)
  ).join("");
}
function css_to_keyframe(css) {
  const keyframe = {};
  const parts = css.split(";");
  for (const part of parts) {
    const [property, value] = part.split(":");
    if (!property || value === void 0) break;
    const formatted_property = css_property_to_camelcase(property.trim());
    keyframe[formatted_property] = value.trim();
  }
  return keyframe;
}
const linear$1 = (t) => t;
function transition(flags2, element, get_fn, get_params) {
  var is_global = (flags2 & TRANSITION_GLOBAL) !== 0;
  var direction = "both";
  var current_options;
  var inert = element.inert;
  var overflow = element.style.overflow;
  var intro;
  var outro;
  function get_options() {
    return without_reactive_context(() => {
      return current_options ??= get_fn()(element, get_params?.() ?? /** @type {P} */
      {}, {
        direction
      });
    });
  }
  var transition2 = {
    is_global,
    in() {
      element.inert = inert;
      dispatch_event(element, "introstart");
      intro = animate(element, get_options(), outro, 1, () => {
        dispatch_event(element, "introend");
        intro?.abort();
        intro = current_options = void 0;
        element.style.overflow = overflow;
      });
    },
    out(fn) {
      element.inert = true;
      dispatch_event(element, "outrostart");
      outro = animate(element, get_options(), intro, 0, () => {
        dispatch_event(element, "outroend");
        fn?.();
      });
    },
    stop: () => {
      intro?.abort();
      outro?.abort();
    }
  };
  var e = (
    /** @type {Effect & { nodes: EffectNodes }} */
    active_effect
  );
  (e.nodes.t ??= []).push(transition2);
  if (should_intro) {
    var run = is_global;
    if (!run) {
      var block2 = (
        /** @type {Effect | null} */
        e.parent
      );
      while (block2 && (block2.f & EFFECT_TRANSPARENT) !== 0) {
        while (block2 = block2.parent) {
          if ((block2.f & BLOCK_EFFECT) !== 0) break;
        }
      }
      run = !block2 || (block2.f & EFFECT_RAN) !== 0;
    }
    if (run) {
      effect(() => {
        untrack(() => transition2.in());
      });
    }
  }
}
function animate(element, options, counterpart, t2, on_finish) {
  var is_intro = t2 === 1;
  if (is_function(options)) {
    var a;
    var aborted = false;
    queue_micro_task(() => {
      if (aborted) return;
      var o = options({ direction: is_intro ? "in" : "out" });
      a = animate(element, o, counterpart, t2, on_finish);
    });
    return {
      abort: () => {
        aborted = true;
        a?.abort();
      },
      deactivate: () => a.deactivate(),
      reset: () => a.reset(),
      t: () => a.t()
    };
  }
  counterpart?.deactivate();
  if (!options?.duration) {
    on_finish();
    return {
      abort: noop,
      deactivate: noop,
      reset: noop,
      t: () => t2
    };
  }
  const { delay = 0, css, tick: tick2, easing = linear$1 } = options;
  var keyframes = [];
  if (is_intro && counterpart === void 0) {
    if (tick2) {
      tick2(0, 1);
    }
    if (css) {
      var styles = css_to_keyframe(css(0, 1));
      keyframes.push(styles, styles);
    }
  }
  var get_t = () => 1 - t2;
  var animation = element.animate(keyframes, { duration: delay, fill: "forwards" });
  animation.onfinish = () => {
    animation.cancel();
    var t1 = counterpart?.t() ?? 1 - t2;
    counterpart?.abort();
    var delta = t2 - t1;
    var duration = (
      /** @type {number} */
      options.duration * Math.abs(delta)
    );
    var keyframes2 = [];
    if (duration > 0) {
      var needs_overflow_hidden = false;
      if (css) {
        var n = Math.ceil(duration / (1e3 / 60));
        for (var i = 0; i <= n; i += 1) {
          var t = t1 + delta * easing(i / n);
          var styles2 = css_to_keyframe(css(t, 1 - t));
          keyframes2.push(styles2);
          needs_overflow_hidden ||= styles2.overflow === "hidden";
        }
      }
      if (needs_overflow_hidden) {
        element.style.overflow = "hidden";
      }
      get_t = () => {
        var time = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          animation.currentTime
        );
        return t1 + delta * easing(time / duration);
      };
      if (tick2) {
        loop(() => {
          if (animation.playState !== "running") return false;
          var t3 = get_t();
          tick2(t3, 1 - t3);
          return true;
        });
      }
    }
    animation = element.animate(keyframes2, { duration, fill: "forwards" });
    animation.onfinish = () => {
      get_t = () => t2;
      tick2?.(t2, 1 - t2);
      on_finish();
    };
  };
  return {
    abort: () => {
      if (animation) {
        animation.cancel();
        animation.effect = null;
        animation.onfinish = noop;
      }
    },
    deactivate: () => {
      on_finish = noop;
    },
    reset: () => {
      if (t2 === 0) {
        tick2?.(1, 0);
      }
    },
    t: () => get_t()
  };
}
const whitespace = [..." 	\n\r\f \v\uFEFF"];
function to_class(value, hash, directives) {
  var classname = value == null ? "" : "" + value;
  if (hash) {
    classname = classname ? classname + " " + hash : hash;
  }
  if (directives) {
    for (var key in directives) {
      if (directives[key]) {
        classname = classname ? classname + " " + key : key;
      } else if (classname.length) {
        var len = key.length;
        var a = 0;
        while ((a = classname.indexOf(key, a)) >= 0) {
          var b = a + len;
          if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) {
            classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
          } else {
            a = b;
          }
        }
      }
    }
  }
  return classname === "" ? null : classname;
}
function to_style(value, styles) {
  return value == null ? null : String(value);
}
function set_class(dom, is_html, value, hash, prev_classes, next_classes) {
  var prev = dom.__className;
  if (prev !== value || prev === void 0) {
    var next_class_name = to_class(value, hash, next_classes);
    {
      if (next_class_name == null) {
        dom.removeAttribute("class");
      } else {
        dom.className = next_class_name;
      }
    }
    dom.__className = value;
  } else if (next_classes && prev_classes !== next_classes) {
    for (var key in next_classes) {
      var is_present = !!next_classes[key];
      if (prev_classes == null || is_present !== !!prev_classes[key]) {
        dom.classList.toggle(key, is_present);
      }
    }
  }
  return next_classes;
}
function set_style(dom, value, prev_styles, next_styles) {
  var prev = dom.__style;
  if (prev !== value) {
    var next_style_attr = to_style(value);
    {
      if (next_style_attr == null) {
        dom.removeAttribute("style");
      } else {
        dom.style.cssText = next_style_attr;
      }
    }
    dom.__style = value;
  }
  return next_styles;
}
const IS_CUSTOM_ELEMENT = Symbol("is custom element");
const IS_HTML = Symbol("is html");
function set_value(element, value) {
  var attributes = get_attributes(element);
  if (attributes.value === (attributes.value = // treat null and undefined the same for the initial value
  value ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  element.value === value && (value !== 0 || element.nodeName !== "PROGRESS")) {
    return;
  }
  element.value = value ?? "";
}
function set_checked(element, checked) {
  var attributes = get_attributes(element);
  if (attributes.checked === (attributes.checked = // treat null and undefined the same for the initial value
  checked ?? void 0)) {
    return;
  }
  element.checked = checked;
}
function set_attribute(element, attribute, value, skip_warning) {
  var attributes = get_attributes(element);
  if (attributes[attribute] === (attributes[attribute] = value)) return;
  if (attribute === "loading") {
    element[LOADING_ATTR_SYMBOL] = value;
  }
  if (value == null) {
    element.removeAttribute(attribute);
  } else if (typeof value !== "string" && get_setters(element).includes(attribute)) {
    element[attribute] = value;
  } else {
    element.setAttribute(attribute, value);
  }
}
function get_attributes(element) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    element.__attributes ??= {
      [IS_CUSTOM_ELEMENT]: element.nodeName.includes("-"),
      [IS_HTML]: element.namespaceURI === NAMESPACE_HTML
    }
  );
}
var setters_cache = /* @__PURE__ */ new Map();
function get_setters(element) {
  var cache_key = element.getAttribute("is") || element.nodeName;
  var setters = setters_cache.get(cache_key);
  if (setters) return setters;
  setters_cache.set(cache_key, setters = []);
  var descriptors;
  var proto = element;
  var element_proto = Element.prototype;
  while (element_proto !== proto) {
    descriptors = get_descriptors(proto);
    for (var key in descriptors) {
      if (descriptors[key].set) {
        setters.push(key);
      }
    }
    proto = get_prototype_of(proto);
  }
  return setters;
}
function bind_value(input, get2, set2 = get2) {
  var batches2 = /* @__PURE__ */ new WeakSet();
  listen_to_event_and_reset_event(input, "input", async (is_reset) => {
    var value = is_reset ? input.defaultValue : input.value;
    value = is_numberlike_input(input) ? to_number(value) : value;
    set2(value);
    if (current_batch !== null) {
      batches2.add(current_batch);
    }
    await tick();
    if (value !== (value = get2())) {
      var start = input.selectionStart;
      var end = input.selectionEnd;
      var length = input.value.length;
      input.value = value ?? "";
      if (end !== null) {
        var new_length = input.value.length;
        if (start === end && end === length && new_length > length) {
          input.selectionStart = new_length;
          input.selectionEnd = new_length;
        } else {
          input.selectionStart = start;
          input.selectionEnd = Math.min(end, new_length);
        }
      }
    }
  });
  if (
    // If we are hydrating and the value has since changed,
    // then use the updated value from the input instead.
    // If defaultValue is set, then value == defaultValue
    // TODO Svelte 6: remove input.value check and set to empty string?
    untrack(get2) == null && input.value
  ) {
    set2(is_numberlike_input(input) ? to_number(input.value) : input.value);
    if (current_batch !== null) {
      batches2.add(current_batch);
    }
  }
  render_effect(() => {
    var value = get2();
    if (input === document.activeElement) {
      var batch = (
        /** @type {Batch} */
        previous_batch ?? current_batch
      );
      if (batches2.has(batch)) {
        return;
      }
    }
    if (is_numberlike_input(input) && value === to_number(input.value)) {
      return;
    }
    if (input.type === "date" && !value && !input.value) {
      return;
    }
    if (value !== input.value) {
      input.value = value ?? "";
    }
  });
}
function is_numberlike_input(input) {
  var type = input.type;
  return type === "number" || type === "range";
}
function to_number(value) {
  return value === "" ? null : +value;
}
function is_bound_this(bound_value, element_or_component) {
  return bound_value === element_or_component || bound_value?.[STATE_SYMBOL] === element_or_component;
}
function bind_this(element_or_component = {}, update, get_value, get_parts) {
  effect(() => {
    var old_parts;
    var parts;
    render_effect(() => {
      old_parts = parts;
      parts = [];
      untrack(() => {
        if (element_or_component !== get_value(...parts)) {
          update(element_or_component, ...parts);
          if (old_parts && is_bound_this(get_value(...old_parts), element_or_component)) {
            update(null, ...old_parts);
          }
        }
      });
    });
    return () => {
      queue_micro_task(() => {
        if (parts && is_bound_this(get_value(...parts), element_or_component)) {
          update(null, ...parts);
        }
      });
    };
  });
  return element_or_component;
}
let is_store_binding = false;
function capture_store_binding(fn) {
  var previous_is_store_binding = is_store_binding;
  try {
    is_store_binding = false;
    return [fn(), is_store_binding];
  } finally {
    is_store_binding = previous_is_store_binding;
  }
}
function prop(props, key, flags2, fallback) {
  var bindable = (flags2 & PROPS_IS_BINDABLE) !== 0;
  var lazy = (flags2 & PROPS_IS_LAZY_INITIAL) !== 0;
  var fallback_value = (
    /** @type {V} */
    fallback
  );
  var fallback_dirty = true;
  var get_fallback = () => {
    if (fallback_dirty) {
      fallback_dirty = false;
      fallback_value = lazy ? untrack(
        /** @type {() => V} */
        fallback
      ) : (
        /** @type {V} */
        fallback
      );
    }
    return fallback_value;
  };
  var setter;
  if (bindable) {
    var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
    setter = get_descriptor(props, key)?.set ?? (is_entry_props && key in props ? (v) => props[key] = v : void 0);
  }
  var initial_value;
  var is_store_sub = false;
  if (bindable) {
    [initial_value, is_store_sub] = capture_store_binding(() => (
      /** @type {V} */
      props[key]
    ));
  } else {
    initial_value = /** @type {V} */
    props[key];
  }
  if (initial_value === void 0 && fallback !== void 0) {
    initial_value = get_fallback();
    if (setter) {
      props_invalid_value();
      setter(initial_value);
    }
  }
  var getter;
  {
    getter = () => {
      var value = (
        /** @type {V} */
        props[key]
      );
      if (value === void 0) return get_fallback();
      fallback_dirty = true;
      return value;
    };
  }
  if ((flags2 & PROPS_IS_UPDATED) === 0) {
    return getter;
  }
  if (setter) {
    var legacy_parent = props.$$legacy;
    return (
      /** @type {() => V} */
      (function(value, mutation) {
        if (arguments.length > 0) {
          if (!mutation || legacy_parent || is_store_sub) {
            setter(mutation ? getter() : value);
          }
          return value;
        }
        return getter();
      })
    );
  }
  var overridden = false;
  var d = ((flags2 & PROPS_IS_IMMUTABLE) !== 0 ? derived : derived_safe_equal)(() => {
    overridden = false;
    return getter();
  });
  if (bindable) get(d);
  var parent_effect = (
    /** @type {Effect} */
    active_effect
  );
  return (
    /** @type {() => V} */
    (function(value, mutation) {
      if (arguments.length > 0) {
        const new_value = mutation ? get(d) : bindable ? proxy(value) : value;
        set(d, new_value);
        overridden = true;
        if (fallback_value !== void 0) {
          fallback_value = new_value;
        }
        return value;
      }
      if (is_destroying_effect && overridden || (parent_effect.f & DESTROYED) !== 0) {
        return d.v;
      }
      return get(d);
    })
  );
}
const PUBLIC_VERSION = "5";
if (typeof window !== "undefined") {
  ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(PUBLIC_VERSION);
}
const linear = (x) => x;
function fade(node, { delay = 0, duration = 400, easing = linear } = {}) {
  const o = +getComputedStyle(node).opacity;
  return {
    delay,
    duration,
    easing,
    css: (t) => `opacity: ${t * o}`
  };
}
function cubicOut(t) {
  const f = t - 1;
  return f * f * f + 1;
}
function modalSlideUp(node, {
  duration = 300,
  easing = cubicOut,
  y = 20,
  scale = 0.95
} = {}) {
  return {
    duration,
    easing,
    css: (t) => {
      const yPos = (1 - t) * y;
      const scaleValue = scale + t * (1 - scale);
      const opacity = t;
      return `
        transform: translateY(${yPos}px) scale(${scaleValue});
        opacity: ${opacity};
      `;
    }
  };
}
function isSnippet(value) {
  return typeof value === "function";
}
var root_3$2 = /* @__PURE__ */ from_html(`<h3 class="wpea-modal__title"><!></h3>`);
var root_7$4 = /* @__PURE__ */ from_html(`<div class="wpea-modal__footer"><!></div>`);
var root_1$9 = /* @__PURE__ */ from_html(`<div><div class="wpea-modal__backdrop" role="button" tabindex="0" aria-label="Close modal"></div> <div class="wpea-modal__container"><div class="wpea-modal__header"><!> <button class="wpea-modal__close" aria-label="Close">&times;</button></div> <div class="wpea-modal__body"><!></div> <!></div></div>`);
function Modal($$anchor, $$props) {
  push($$props, true);
  let open = prop($$props, "open", 15, false), size = prop($$props, "size", 3, "standard"), title = prop($$props, "title", 3, "");
  const sizeClass = /* @__PURE__ */ user_derived(() => size() === "large" ? "wpea-modal--large" : size() === "fullscreen" ? "wpea-modal--fullscreen" : "");
  function getSettings() {
    try {
      const stored = localStorage.getItem("ab-wp-bits-settings");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
    }
    return { compactMode: false, themeMode: "auto" };
  }
  let settings = /* @__PURE__ */ state(proxy(getSettings()));
  user_effect(() => {
    if (open()) {
      set(settings, getSettings(), true);
    }
  });
  let colorScheme = /* @__PURE__ */ user_derived(() => get(settings).themeMode === "light" ? "light only" : get(settings).themeMode === "dark" ? "dark only" : "light dark");
  function handleClose() {
    open(false);
    $$props.onClose?.();
  }
  function handleBackdropClick() {
    handleClose();
  }
  function handleBackdropKeydown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClose();
    }
  }
  function handleKeydown(e) {
    if (e.key === "Escape") {
      handleClose();
    }
  }
  user_effect(() => {
    if (open()) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeydown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeydown);
    };
  });
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent_4 = ($$anchor2) => {
      var div = root_1$9();
      let classes;
      var div_1 = child(div);
      div_1.__click = handleBackdropClick;
      div_1.__keydown = handleBackdropKeydown;
      var div_2 = sibling(div_1, 2);
      var div_3 = child(div_2);
      var node_1 = child(div_3);
      {
        var consequent = ($$anchor3) => {
          var fragment_1 = comment();
          var node_2 = first_child(fragment_1);
          snippet(node_2, () => $$props.header);
          append($$anchor3, fragment_1);
        };
        var alternate_1 = ($$anchor3) => {
          var h3 = root_3$2();
          var node_3 = child(h3);
          {
            var consequent_1 = ($$anchor4) => {
              var fragment_2 = comment();
              var node_4 = first_child(fragment_2);
              snippet(node_4, title);
              append($$anchor4, fragment_2);
            };
            var alternate = ($$anchor4) => {
              var text$1 = text();
              template_effect(() => set_text(text$1, title()));
              append($$anchor4, text$1);
            };
            if_block(node_3, ($$render) => {
              if (isSnippet(title())) $$render(consequent_1);
              else $$render(alternate, false);
            });
          }
          append($$anchor3, h3);
        };
        if_block(node_1, ($$render) => {
          if ($$props.header) $$render(consequent);
          else $$render(alternate_1, false);
        });
      }
      var button = sibling(node_1, 2);
      button.__click = handleClose;
      var div_4 = sibling(div_3, 2);
      var node_5 = child(div_4);
      {
        var consequent_2 = ($$anchor3) => {
          var fragment_4 = comment();
          var node_6 = first_child(fragment_4);
          snippet(node_6, () => $$props.children);
          append($$anchor3, fragment_4);
        };
        if_block(node_5, ($$render) => {
          if ($$props.children) $$render(consequent_2);
        });
      }
      var node_7 = sibling(div_4, 2);
      {
        var consequent_3 = ($$anchor3) => {
          var div_5 = root_7$4();
          var node_8 = child(div_5);
          snippet(node_8, () => $$props.footer);
          append($$anchor3, div_5);
        };
        if_block(node_7, ($$render) => {
          if ($$props.footer) $$render(consequent_3);
        });
      }
      template_effect(() => {
        classes = set_class(div, 1, `wpea wpea-full wpea-modal wpea-modal--open ${get(sizeClass) ?? ""}`, null, classes, { "ab-wp-bits-admin--compact": get(settings).compactMode });
        set_style(div, `font-family: var(--wpea-font-sans); color-scheme: ${get(colorScheme) ?? ""}; position: fixed; inset: 0; z-index: 999999; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5);`);
      });
      transition(3, div_2, () => modalSlideUp, () => ({ duration: 300 }));
      transition(3, div, () => fade, () => ({ duration: 200 }));
      append($$anchor2, div);
    };
    if_block(node, ($$render) => {
      if (open()) $$render(consequent_4);
    });
  }
  append($$anchor, fragment);
  pop();
}
delegate(["click", "keydown"]);
var root$5 = /* @__PURE__ */ from_html(`<div><!></div>`);
function Stack($$anchor, $$props) {
  let className = prop($$props, "class", 3, "");
  let sizeClass = /* @__PURE__ */ user_derived(() => $$props.size ? `wpea-stack--${$$props.size}` : "");
  var div = root$5();
  var node = child(div);
  {
    var consequent = ($$anchor2) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      snippet(node_1, () => $$props.children);
      append($$anchor2, fragment);
    };
    if_block(node, ($$render) => {
      if ($$props.children) $$render(consequent);
    });
  }
  template_effect(() => {
    set_class(div, 1, `wpea-stack ${get(sizeClass) ?? ""} ${className() ?? ""}`);
    set_style(div, $$props.style);
  });
  append($$anchor, div);
}
var root_4$3 = /* @__PURE__ */ from_html(`<h3 class="wpea-card__title"><!></h3>`);
var root_7$3 = /* @__PURE__ */ from_html(`<div class="wpea-card__sub"><!></div>`);
var root_3$1 = /* @__PURE__ */ from_html(`<!> <!>`, 1);
var root_10$2 = /* @__PURE__ */ from_html(`<div class="wpea-card__actions"><!></div>`);
var root_1$8 = /* @__PURE__ */ from_html(`<div class="wpea-card__header"><div><!></div> <!></div>`);
var root$4 = /* @__PURE__ */ from_html(`<div><!> <!></div>`);
function Card($$anchor, $$props) {
  push($$props, true);
  let muted = prop($$props, "muted", 3, false), hover = prop($$props, "hover", 3, false), className = prop($$props, "class", 3, "");
  let mutedClass = /* @__PURE__ */ user_derived(() => muted() ? "wpea-card--muted" : "");
  let hoverClass = /* @__PURE__ */ user_derived(() => hover() ? "wpea-card--hover" : "");
  let hasHeader = /* @__PURE__ */ user_derived(() => $$props.title || $$props.subtitle || $$props.header || $$props.actions);
  var div = root$4();
  var node = child(div);
  {
    var consequent_6 = ($$anchor2) => {
      var div_1 = root_1$8();
      var div_2 = child(div_1);
      var node_1 = child(div_2);
      {
        var consequent = ($$anchor3) => {
          var fragment = comment();
          var node_2 = first_child(fragment);
          snippet(node_2, () => $$props.header);
          append($$anchor3, fragment);
        };
        var alternate_2 = ($$anchor3) => {
          var fragment_1 = root_3$1();
          var node_3 = first_child(fragment_1);
          {
            var consequent_2 = ($$anchor4) => {
              var h3 = root_4$3();
              var node_4 = child(h3);
              {
                var consequent_1 = ($$anchor5) => {
                  var fragment_2 = comment();
                  var node_5 = first_child(fragment_2);
                  snippet(node_5, () => $$props.title);
                  append($$anchor5, fragment_2);
                };
                var alternate = ($$anchor5) => {
                  var text$1 = text();
                  template_effect(() => set_text(text$1, $$props.title));
                  append($$anchor5, text$1);
                };
                if_block(node_4, ($$render) => {
                  if (isSnippet($$props.title)) $$render(consequent_1);
                  else $$render(alternate, false);
                });
              }
              append($$anchor4, h3);
            };
            if_block(node_3, ($$render) => {
              if ($$props.title) $$render(consequent_2);
            });
          }
          var node_6 = sibling(node_3, 2);
          {
            var consequent_4 = ($$anchor4) => {
              var div_3 = root_7$3();
              var node_7 = child(div_3);
              {
                var consequent_3 = ($$anchor5) => {
                  var fragment_4 = comment();
                  var node_8 = first_child(fragment_4);
                  snippet(node_8, () => $$props.subtitle);
                  append($$anchor5, fragment_4);
                };
                var alternate_1 = ($$anchor5) => {
                  var text_1 = text();
                  template_effect(() => set_text(text_1, $$props.subtitle));
                  append($$anchor5, text_1);
                };
                if_block(node_7, ($$render) => {
                  if (isSnippet($$props.subtitle)) $$render(consequent_3);
                  else $$render(alternate_1, false);
                });
              }
              append($$anchor4, div_3);
            };
            if_block(node_6, ($$render) => {
              if ($$props.subtitle) $$render(consequent_4);
            });
          }
          append($$anchor3, fragment_1);
        };
        if_block(node_1, ($$render) => {
          if ($$props.header) $$render(consequent);
          else $$render(alternate_2, false);
        });
      }
      var node_9 = sibling(div_2, 2);
      {
        var consequent_5 = ($$anchor3) => {
          var div_4 = root_10$2();
          var node_10 = child(div_4);
          snippet(node_10, () => $$props.actions);
          append($$anchor3, div_4);
        };
        if_block(node_9, ($$render) => {
          if ($$props.actions) $$render(consequent_5);
        });
      }
      append($$anchor2, div_1);
    };
    if_block(node, ($$render) => {
      if (get(hasHeader)) $$render(consequent_6);
    });
  }
  var node_11 = sibling(node, 2);
  {
    var consequent_7 = ($$anchor2) => {
      var fragment_6 = comment();
      var node_12 = first_child(fragment_6);
      snippet(node_12, () => $$props.children);
      append($$anchor2, fragment_6);
    };
    if_block(node_11, ($$render) => {
      if ($$props.children) $$render(consequent_7);
    });
  }
  template_effect(() => {
    set_class(div, 1, `wpea-card ${get(mutedClass) ?? ""} ${get(hoverClass) ?? ""} ${className() ?? ""}`);
    set_style(div, $$props.style);
  });
  append($$anchor, div);
  pop();
}
var root_1$7 = /* @__PURE__ */ from_html(`<label class="wpea-label"><!></label>`);
var root_5$4 = /* @__PURE__ */ from_html(`<span class="wpea-multiselect__tag"><span class="wpea-multiselect__tag-label"><!></span> <button type="button" class="wpea-multiselect__tag-remove" tabindex="-1"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg></button></span>`);
var root_9$1 = /* @__PURE__ */ from_html(`<span class="wpea-multiselect__single-value"><!></span>`);
var root_12$2 = /* @__PURE__ */ from_html(`<input type="text" class="wpea-multiselect__input"/>`);
var root_14$1 = /* @__PURE__ */ from_html(`<span class="wpea-multiselect__placeholder"> </span>`);
var root_15$1 = /* @__PURE__ */ from_html(`<button type="button" class="wpea-multiselect__clear" tabindex="-1" aria-label="Clear all"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg></button>`);
var root_22 = /* @__PURE__ */ from_svg(`<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>`, 1);
var root_23 = /* @__PURE__ */ from_svg(`<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>`, 1);
var root_21$1 = /* @__PURE__ */ from_html(`<button type="button"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><!></svg></button> <button type="button"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg></button>`, 1);
var root_25$1 = /* @__PURE__ */ from_html(`<span class="wpea-multiselect__option-protected" aria-label="Protected"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M4.93 4.93l14.14 14.14"></path></svg></span>`);
var root_20 = /* @__PURE__ */ from_html(`<div class="wpea-multiselect__option-actions"><!></div>`);
var root_27$1 = /* @__PURE__ */ from_svg(`<svg class="wpea-multiselect__option-check" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11.5 4L5.5 10L2.5 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
var root_17$2 = /* @__PURE__ */ from_html(`<div role="option" tabindex="-1"><span class="wpea-multiselect__option-label"><!></span> <!></div>`);
var root_29 = /* @__PURE__ */ from_html(`<div class="wpea-multiselect__no-options">No options</div>`);
var root_30$1 = /* @__PURE__ */ from_html(`<div role="option" tabindex="-1" aria-selected="false"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-right: var(--wpea-space--xs);"><path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg> </div>`);
var root_16$1 = /* @__PURE__ */ from_html(`<div class="wpea-multiselect__menu" role="listbox"><div class="wpea-multiselect__menu-list"><!> <!></div></div>`);
var root_31$1 = /* @__PURE__ */ from_html(`<span class="wpea-help"><!></span>`);
var root$3 = /* @__PURE__ */ from_html(`<div class="wpea-field"><!> <div><div class="wpea-multiselect__control" role="combobox" aria-haspopup="listbox"><div class="wpea-multiselect__value-container"><!> <!></div> <div class="wpea-multiselect__indicators"><!> <span class="wpea-multiselect__separator"></span> <span class="wpea-multiselect__dropdown-indicator"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></span></div></div> <!></div> <!></div>`);
function AdvancedSelect($$anchor, $$props) {
  push($$props, true);
  let value = prop($$props, "value", 31, () => proxy([])), options = prop($$props, "options", 19, () => []), placeholder = prop($$props, "placeholder", 3, "Select..."), disabled = prop($$props, "disabled", 3, false), searchable = prop($$props, "searchable", 3, true), clearable = prop($$props, "clearable", 3, true), multiple = prop($$props, "multiple", 3, true), creatable = prop($$props, "creatable", 3, false), manageable = prop($$props, "manageable", 3, false);
  let isOpen = /* @__PURE__ */ state(false);
  let searchQuery = /* @__PURE__ */ state("");
  let highlightedIndex = /* @__PURE__ */ state(-1);
  let containerRef;
  let searchInputRef = /* @__PURE__ */ state(null);
  const listboxId = `wpea-multiselect-listbox-${Math.random().toString(36).slice(2, 9)}`;
  function getSearchableLabel(opt) {
    return typeof opt.label === "string" ? opt.label : opt.value;
  }
  let internalValue = /* @__PURE__ */ user_derived(() => Array.isArray(value()) ? value() : value() ? [value()] : []);
  let filteredOptions = /* @__PURE__ */ user_derived(() => get(searchQuery) ? options().filter((opt) => getSearchableLabel(opt).toLowerCase().includes(get(searchQuery).toLowerCase()) && !opt.disabled) : options().filter((opt) => !opt.disabled));
  let selectedOptions = /* @__PURE__ */ user_derived(() => get(internalValue).map((v) => options().find((o) => o.value === v)).filter(Boolean));
  let canAddMore = /* @__PURE__ */ user_derived(() => multiple() ? !$$props.maxItems || get(internalValue).length < $$props.maxItems : true);
  let hasExactMatch = /* @__PURE__ */ user_derived(() => options().some((opt) => getSearchableLabel(opt).toLowerCase() === get(searchQuery).toLowerCase()));
  let showCreateOption = /* @__PURE__ */ user_derived(() => creatable() && get(searchQuery).trim() !== "" && !get(hasExactMatch) && get(canAddMore));
  function dispatchEvent(eventName, detail) {
    const event2 = new CustomEvent(`AdvancedSelect:${eventName}`, {
      bubbles: true,
      detail: { component: containerRef, id: $$props.id, ...detail }
    });
    containerRef?.dispatchEvent(event2);
  }
  function updateValue(newInternalValue) {
    if (multiple()) {
      value(newInternalValue);
      $$props.onchange?.(newInternalValue);
    } else {
      value(newInternalValue[0] || "");
      $$props.onchange?.(newInternalValue[0] || "");
    }
  }
  function toggleDropdown() {
    if (disabled()) return;
    set(isOpen, !get(isOpen));
    if (get(isOpen)) {
      set(searchQuery, "");
      set(highlightedIndex, -1);
      setTimeout(() => get(searchInputRef)?.focus(), 10);
    }
  }
  function selectOption(option) {
    if (!get(canAddMore) && !get(internalValue).includes(option.value)) return;
    let newValue;
    if (multiple()) {
      if (get(internalValue).includes(option.value)) {
        newValue = get(internalValue).filter((v) => v !== option.value);
      } else {
        newValue = [...get(internalValue), option.value];
      }
    } else {
      newValue = [option.value];
      set(isOpen, false);
    }
    set(searchQuery, "");
    updateValue(newValue);
  }
  function removeOption(optionValue, event2) {
    event2?.stopPropagation();
    const newValue = get(internalValue).filter((v) => v !== optionValue);
    updateValue(newValue);
  }
  function clearAll(event2) {
    event2.stopPropagation();
    updateValue([]);
  }
  function handleCreate() {
    if (!get(searchQuery).trim()) return;
    dispatchEvent("create", {
      value: get(searchQuery).trim(),
      query: get(searchQuery).trim()
    });
    set(searchQuery, "");
  }
  function handleDelete(option, event2) {
    event2.stopPropagation();
    if (!option.deletable || option.locked) return;
    dispatchEvent("delete", { value: option.value, option });
  }
  function handleLock(option, event2) {
    event2.stopPropagation();
    dispatchEvent("lock", { value: option.value, option });
  }
  function handleKeydown(event2) {
    switch (event2.key) {
      case "Escape":
        set(isOpen, false);
        break;
      case "ArrowDown":
        event2.preventDefault();
        if (!get(isOpen)) {
          set(isOpen, true);
        } else {
          const maxIndex = get(filteredOptions).length + (get(showCreateOption) ? 0 : -1);
          set(highlightedIndex, Math.min(get(highlightedIndex) + 1, maxIndex), true);
        }
        break;
      case "ArrowUp":
        event2.preventDefault();
        set(highlightedIndex, Math.max(get(highlightedIndex) - 1, 0), true);
        break;
      case "Enter":
        event2.preventDefault();
        if (get(showCreateOption) && (get(highlightedIndex) === get(filteredOptions).length || get(filteredOptions).length === 0)) {
          handleCreate();
        } else if (get(highlightedIndex) >= 0 && get(filteredOptions)[get(highlightedIndex)]) {
          selectOption(get(filteredOptions)[get(highlightedIndex)]);
        }
        break;
      case "Backspace":
        if (get(searchQuery) === "" && get(internalValue).length > 0) {
          removeOption(get(internalValue)[get(internalValue).length - 1]);
        }
        break;
    }
  }
  function handleClickOutside(event2) {
    if (containerRef && !containerRef.contains(event2.target)) {
      set(isOpen, false);
    }
  }
  user_effect(() => {
    if (get(isOpen)) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  });
  let colorClass = /* @__PURE__ */ user_derived(() => $$props.color ? `wpea-multiselect--${$$props.color}` : "");
  var div = root$3();
  var node = child(div);
  {
    var consequent_1 = ($$anchor2) => {
      var label_1 = root_1$7();
      var node_1 = child(label_1);
      {
        var consequent = ($$anchor3) => {
          var fragment = comment();
          var node_2 = first_child(fragment);
          snippet(node_2, () => $$props.label);
          append($$anchor3, fragment);
        };
        var alternate = ($$anchor3) => {
          var text$1 = text();
          template_effect(() => set_text(text$1, $$props.label));
          append($$anchor3, text$1);
        };
        if_block(node_1, ($$render) => {
          if (isSnippet($$props.label)) $$render(consequent);
          else $$render(alternate, false);
        });
      }
      template_effect(() => set_attribute(label_1, "for", $$props.id));
      append($$anchor2, label_1);
    };
    if_block(node, ($$render) => {
      if ($$props.label) $$render(consequent_1);
    });
  }
  var div_1 = sibling(node, 2);
  let classes;
  var div_2 = child(div_1);
  div_2.__click = toggleDropdown;
  div_2.__keydown = handleKeydown;
  var div_3 = child(div_2);
  var node_3 = child(div_3);
  {
    var consequent_3 = ($$anchor2) => {
      var fragment_2 = comment();
      var node_4 = first_child(fragment_2);
      each(node_4, 17, () => get(selectedOptions), index, ($$anchor3, option) => {
        var span = root_5$4();
        var span_1 = child(span);
        var node_5 = child(span_1);
        {
          var consequent_2 = ($$anchor4) => {
            var fragment_3 = comment();
            var node_6 = first_child(fragment_3);
            snippet(node_6, () => get(option).label);
            append($$anchor4, fragment_3);
          };
          var alternate_1 = ($$anchor4) => {
            var text_1 = text();
            template_effect(() => set_text(text_1, get(option).label));
            append($$anchor4, text_1);
          };
          if_block(node_5, ($$render) => {
            if (isSnippet(get(option).label)) $$render(consequent_2);
            else $$render(alternate_1, false);
          });
        }
        var button = sibling(span_1, 2);
        button.__click = (e) => removeOption(get(option).value, e);
        template_effect(($0) => set_attribute(button, "aria-label", `Remove ${$0 ?? ""}`), [() => getSearchableLabel(get(option))]);
        append($$anchor3, span);
      });
      append($$anchor2, fragment_2);
    };
    var alternate_3 = ($$anchor2) => {
      var fragment_5 = comment();
      var node_7 = first_child(fragment_5);
      {
        var consequent_5 = ($$anchor3) => {
          var span_2 = root_9$1();
          var node_8 = child(span_2);
          {
            var consequent_4 = ($$anchor4) => {
              var fragment_6 = comment();
              var node_9 = first_child(fragment_6);
              snippet(node_9, () => get(selectedOptions)[0].label);
              append($$anchor4, fragment_6);
            };
            var alternate_2 = ($$anchor4) => {
              var text_2 = text();
              template_effect(() => set_text(text_2, get(selectedOptions)[0].label));
              append($$anchor4, text_2);
            };
            if_block(node_8, ($$render) => {
              if (isSnippet(get(selectedOptions)[0].label)) $$render(consequent_4);
              else $$render(alternate_2, false);
            });
          }
          append($$anchor3, span_2);
        };
        if_block(
          node_7,
          ($$render) => {
            if (get(selectedOptions).length > 0 && !get(isOpen)) $$render(consequent_5);
          },
          true
        );
      }
      append($$anchor2, fragment_5);
    };
    if_block(node_3, ($$render) => {
      if (multiple()) $$render(consequent_3);
      else $$render(alternate_3, false);
    });
  }
  var node_10 = sibling(node_3, 2);
  {
    var consequent_6 = ($$anchor2) => {
      var input = root_12$2();
      input.__keydown = handleKeydown;
      input.__click = (e) => e.stopPropagation();
      bind_this(input, ($$value) => set(searchInputRef, $$value), () => get(searchInputRef));
      template_effect(() => {
        set_attribute(input, "placeholder", get(internalValue).length === 0 ? placeholder() : multiple() ? "" : placeholder());
        input.disabled = disabled();
      });
      bind_value(input, () => get(searchQuery), ($$value) => set(searchQuery, $$value));
      append($$anchor2, input);
    };
    var alternate_4 = ($$anchor2) => {
      var fragment_8 = comment();
      var node_11 = first_child(fragment_8);
      {
        var consequent_7 = ($$anchor3) => {
          var span_3 = root_14$1();
          var text_3 = child(span_3);
          template_effect(() => set_text(text_3, placeholder()));
          append($$anchor3, span_3);
        };
        if_block(
          node_11,
          ($$render) => {
            if (get(internalValue).length === 0) $$render(consequent_7);
          },
          true
        );
      }
      append($$anchor2, fragment_8);
    };
    if_block(node_10, ($$render) => {
      if (searchable() && get(isOpen)) $$render(consequent_6);
      else $$render(alternate_4, false);
    });
  }
  var div_4 = sibling(div_3, 2);
  var node_12 = child(div_4);
  {
    var consequent_8 = ($$anchor2) => {
      var button_1 = root_15$1();
      button_1.__click = clearAll;
      append($$anchor2, button_1);
    };
    if_block(node_12, ($$render) => {
      if (clearable() && get(internalValue).length > 0) $$render(consequent_8);
    });
  }
  var node_13 = sibling(div_2, 2);
  {
    var consequent_17 = ($$anchor2) => {
      var div_5 = root_16$1();
      var div_6 = child(div_5);
      var node_14 = child(div_6);
      each(
        node_14,
        17,
        () => get(filteredOptions),
        index,
        ($$anchor3, option, i) => {
          var div_7 = root_17$2();
          let classes_1;
          div_7.__click = () => selectOption(get(option));
          div_7.__keydown = (e) => {
            if (e.key === "Enter" || e.key === " ") selectOption(get(option));
          };
          var span_4 = child(div_7);
          var node_15 = child(span_4);
          {
            var consequent_9 = ($$anchor4) => {
              var fragment_9 = comment();
              var node_16 = first_child(fragment_9);
              snippet(node_16, () => get(option).label);
              append($$anchor4, fragment_9);
            };
            var alternate_5 = ($$anchor4) => {
              var text_4 = text();
              template_effect(() => set_text(text_4, get(option).label));
              append($$anchor4, text_4);
            };
            if_block(node_15, ($$render) => {
              if (isSnippet(get(option).label)) $$render(consequent_9);
              else $$render(alternate_5, false);
            });
          }
          var node_17 = sibling(span_4, 2);
          {
            var consequent_13 = ($$anchor4) => {
              var div_8 = root_20();
              var node_18 = child(div_8);
              {
                var consequent_11 = ($$anchor5) => {
                  var fragment_11 = root_21$1();
                  var button_2 = first_child(fragment_11);
                  let classes_2;
                  button_2.__click = (e) => handleLock(get(option), e);
                  var svg = child(button_2);
                  var node_19 = child(svg);
                  {
                    var consequent_10 = ($$anchor6) => {
                      var fragment_12 = root_22();
                      append($$anchor6, fragment_12);
                    };
                    var alternate_6 = ($$anchor6) => {
                      var fragment_13 = root_23();
                      append($$anchor6, fragment_13);
                    };
                    if_block(node_19, ($$render) => {
                      if (get(option).locked) $$render(consequent_10);
                      else $$render(alternate_6, false);
                    });
                  }
                  var button_3 = sibling(button_2, 2);
                  let classes_3;
                  button_3.__click = (e) => handleDelete(get(option), e);
                  template_effect(
                    ($0) => {
                      classes_2 = set_class(button_2, 1, "wpea-multiselect__option-lock", null, classes_2, {
                        "wpea-multiselect__option-lock--locked": get(option).locked
                      });
                      set_attribute(button_2, "aria-label", get(option).locked ? "Unlock" : "Lock");
                      classes_3 = set_class(button_3, 1, "wpea-multiselect__option-delete", null, classes_3, {
                        "wpea-multiselect__option-delete--disabled": get(option).locked
                      });
                      button_3.disabled = get(option).locked;
                      set_attribute(button_3, "aria-label", `Delete ${$0 ?? ""}`);
                    },
                    [() => getSearchableLabel(get(option))]
                  );
                  append($$anchor5, fragment_11);
                };
                var alternate_7 = ($$anchor5) => {
                  var fragment_14 = comment();
                  var node_20 = first_child(fragment_14);
                  {
                    var consequent_12 = ($$anchor6) => {
                      var span_5 = root_25$1();
                      append($$anchor6, span_5);
                    };
                    if_block(
                      node_20,
                      ($$render) => {
                        if (get(option).deletable === false) $$render(consequent_12);
                      },
                      true
                    );
                  }
                  append($$anchor5, fragment_14);
                };
                if_block(node_18, ($$render) => {
                  if (get(option).deletable === true) $$render(consequent_11);
                  else $$render(alternate_7, false);
                });
              }
              append($$anchor4, div_8);
            };
            var alternate_8 = ($$anchor4) => {
              var fragment_15 = comment();
              var node_21 = first_child(fragment_15);
              {
                var consequent_14 = ($$anchor5) => {
                  var svg_1 = root_27$1();
                  append($$anchor5, svg_1);
                };
                if_block(
                  node_21,
                  ($$render) => {
                    if (get(internalValue).includes(get(option).value)) $$render(consequent_14);
                  },
                  true
                );
              }
              append($$anchor4, fragment_15);
            };
            if_block(node_17, ($$render) => {
              if (manageable()) $$render(consequent_13);
              else $$render(alternate_8, false);
            });
          }
          template_effect(
            ($0, $1) => {
              classes_1 = set_class(div_7, 1, "wpea-multiselect__option", null, classes_1, $0);
              set_attribute(div_7, "aria-selected", $1);
            },
            [
              () => ({
                "wpea-multiselect__option--selected": get(internalValue).includes(get(option).value),
                "wpea-multiselect__option--highlighted": i === get(highlightedIndex),
                "wpea-multiselect__option--disabled": !get(canAddMore) && !get(internalValue).includes(get(option).value)
              }),
              () => get(internalValue).includes(get(option).value)
            ]
          );
          event("mouseenter", div_7, () => set(highlightedIndex, i, true));
          append($$anchor3, div_7);
        },
        ($$anchor3) => {
          var fragment_16 = comment();
          var node_22 = first_child(fragment_16);
          {
            var consequent_15 = ($$anchor4) => {
              var div_9 = root_29();
              append($$anchor4, div_9);
            };
            if_block(node_22, ($$render) => {
              if (!get(showCreateOption)) $$render(consequent_15);
            });
          }
          append($$anchor3, fragment_16);
        }
      );
      var node_23 = sibling(node_14, 2);
      {
        var consequent_16 = ($$anchor3) => {
          var div_10 = root_30$1();
          let classes_4;
          div_10.__click = handleCreate;
          div_10.__keydown = (e) => {
            if (e.key === "Enter" || e.key === " ") handleCreate();
          };
          var text_5 = sibling(child(div_10));
          template_effect(() => {
            classes_4 = set_class(div_10, 1, "wpea-multiselect__option wpea-multiselect__option--create", null, classes_4, {
              "wpea-multiselect__option--highlighted": get(highlightedIndex) === get(filteredOptions).length
            });
            set_text(text_5, ` Create "${get(searchQuery) ?? ""}"`);
          });
          event("mouseenter", div_10, () => set(highlightedIndex, get(filteredOptions).length, true));
          append($$anchor3, div_10);
        };
        if_block(node_23, ($$render) => {
          if (get(showCreateOption)) $$render(consequent_16);
        });
      }
      template_effect(() => {
        set_attribute(div_5, "aria-multiselectable", multiple());
        set_attribute(div_5, "id", listboxId);
      });
      append($$anchor2, div_5);
    };
    if_block(node_13, ($$render) => {
      if (get(isOpen)) $$render(consequent_17);
    });
  }
  bind_this(div_1, ($$value) => containerRef = $$value, () => containerRef);
  var node_24 = sibling(div_1, 2);
  {
    var consequent_19 = ($$anchor2) => {
      var span_6 = root_31$1();
      var node_25 = child(span_6);
      {
        var consequent_18 = ($$anchor3) => {
          var fragment_17 = comment();
          var node_26 = first_child(fragment_17);
          snippet(node_26, () => $$props.help);
          append($$anchor3, fragment_17);
        };
        var alternate_9 = ($$anchor3) => {
          var text_6 = text();
          template_effect(() => set_text(text_6, $$props.help));
          append($$anchor3, text_6);
        };
        if_block(node_25, ($$render) => {
          if (isSnippet($$props.help)) $$render(consequent_18);
          else $$render(alternate_9, false);
        });
      }
      append($$anchor2, span_6);
    };
    if_block(node_24, ($$render) => {
      if ($$props.help) $$render(consequent_19);
    });
  }
  template_effect(() => {
    classes = set_class(div_1, 1, `wpea-multiselect ${get(colorClass) ?? ""}`, null, classes, {
      "wpea-multiselect--open": get(isOpen),
      "wpea-multiselect--disabled": disabled(),
      "wpea-multiselect--has-value": get(internalValue).length > 0,
      "wpea-multiselect--single": !multiple()
    });
    set_attribute(div_2, "aria-controls", listboxId);
    set_attribute(div_2, "aria-expanded", get(isOpen));
    set_attribute(div_2, "tabindex", disabled() ? -1 : 0);
  });
  append($$anchor, div);
  pop();
}
delegate(["click", "keydown"]);
var root_2$3 = /* @__PURE__ */ from_html(`<label class="wpea-label"><!></label>`);
var root_5$3 = /* @__PURE__ */ from_html(`<span class="wpea-help"><!></span>`);
var root_1$6 = /* @__PURE__ */ from_html(`<div class="wpea-field"><!> <input/> <!></div>`);
var root_8$3 = /* @__PURE__ */ from_html(`<input/>`);
function Input($$anchor, $$props) {
  push($$props, true);
  let value = prop($$props, "value", 15, ""), type = prop($$props, "type", 3, "text"), disabled = prop($$props, "disabled", 3, false), readonly = prop($$props, "readonly", 3, false), required = prop($$props, "required", 3, false), className = prop($$props, "class", 3, "");
  function handleInput(event2) {
    const target = event2.target;
    value(target.value);
    $$props.oninput?.(value());
  }
  function handleChange(event2) {
    const target = event2.target;
    value(target.value);
    $$props.onchange?.(value());
  }
  let sizeClass = /* @__PURE__ */ user_derived(() => $$props.size ? `wpea-input--${$$props.size}` : "");
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent_4 = ($$anchor2) => {
      var div = root_1$6();
      var node_1 = child(div);
      {
        var consequent_1 = ($$anchor3) => {
          var label_1 = root_2$3();
          var node_2 = child(label_1);
          {
            var consequent = ($$anchor4) => {
              var fragment_1 = comment();
              var node_3 = first_child(fragment_1);
              snippet(node_3, () => $$props.label);
              append($$anchor4, fragment_1);
            };
            var alternate = ($$anchor4) => {
              var text$1 = text();
              template_effect(() => set_text(text$1, $$props.label));
              append($$anchor4, text$1);
            };
            if_block(node_2, ($$render) => {
              if (isSnippet($$props.label)) $$render(consequent);
              else $$render(alternate, false);
            });
          }
          template_effect(() => set_attribute(label_1, "for", $$props.id));
          append($$anchor3, label_1);
        };
        if_block(node_1, ($$render) => {
          if ($$props.label) $$render(consequent_1);
        });
      }
      var input = sibling(node_1, 2);
      input.__input = handleInput;
      input.__change = handleChange;
      var node_4 = sibling(input, 2);
      {
        var consequent_3 = ($$anchor3) => {
          var span = root_5$3();
          var node_5 = child(span);
          {
            var consequent_2 = ($$anchor4) => {
              var fragment_3 = comment();
              var node_6 = first_child(fragment_3);
              snippet(node_6, () => $$props.help);
              append($$anchor4, fragment_3);
            };
            var alternate_1 = ($$anchor4) => {
              var text_1 = text();
              template_effect(() => set_text(text_1, $$props.help));
              append($$anchor4, text_1);
            };
            if_block(node_5, ($$render) => {
              if (isSnippet($$props.help)) $$render(consequent_2);
              else $$render(alternate_1, false);
            });
          }
          append($$anchor3, span);
        };
        if_block(node_4, ($$render) => {
          if ($$props.help) $$render(consequent_3);
        });
      }
      template_effect(() => {
        set_class(input, 1, `wpea-input ${get(sizeClass) ?? ""} ${className() ?? ""}`);
        set_style(input, $$props.style);
        set_attribute(input, "type", type());
        set_attribute(input, "id", $$props.id);
        set_attribute(input, "name", $$props.name);
        set_attribute(input, "placeholder", $$props.placeholder);
        input.disabled = disabled();
        input.readOnly = readonly();
        input.required = required();
        set_value(input, value());
      });
      append($$anchor2, div);
    };
    var alternate_2 = ($$anchor2) => {
      var input_1 = root_8$3();
      input_1.__input = handleInput;
      input_1.__change = handleChange;
      template_effect(() => {
        set_class(input_1, 1, `wpea-input ${get(sizeClass) ?? ""} ${className() ?? ""}`);
        set_style(input_1, $$props.style);
        set_attribute(input_1, "type", type());
        set_attribute(input_1, "id", $$props.id);
        set_attribute(input_1, "name", $$props.name);
        set_attribute(input_1, "placeholder", $$props.placeholder);
        input_1.disabled = disabled();
        input_1.readOnly = readonly();
        input_1.required = required();
        set_value(input_1, value());
      });
      append($$anchor2, input_1);
    };
    if_block(node, ($$render) => {
      if ($$props.label || $$props.help) $$render(consequent_4);
      else $$render(alternate_2, false);
    });
  }
  append($$anchor, fragment);
  pop();
}
delegate(["input", "change"]);
var root_2$2 = /* @__PURE__ */ from_html(`<label class="wpea-label"><!></label>`);
var root_5$2 = /* @__PURE__ */ from_html(`<span class="wpea-help"><!></span>`);
var root_1$5 = /* @__PURE__ */ from_html(`<div class="wpea-field"><!> <div class="wpea-number-wrapper"><input type="number"/> <div class="wpea-number-wrapper__controls"><button type="button" class="wpea-number-wrapper__btn" aria-label="Increase value" tabindex="-1"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 8L6 4L10 8"></path></svg></button> <button type="button" class="wpea-number-wrapper__btn" aria-label="Decrease value" tabindex="-1"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 4L6 8L10 4"></path></svg></button></div></div> <!></div>`);
var root_8$2 = /* @__PURE__ */ from_html(`<div class="wpea-number-wrapper"><input type="number"/> <div class="wpea-number-wrapper__controls"><button type="button" class="wpea-number-wrapper__btn" aria-label="Increase value" tabindex="-1"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 8L6 4L10 8"></path></svg></button> <button type="button" class="wpea-number-wrapper__btn" aria-label="Decrease value" tabindex="-1"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 4L6 8L10 4"></path></svg></button></div></div>`);
function NumberInput($$anchor, $$props) {
  push($$props, true);
  let value = prop($$props, "value", 15, 0), disabled = prop($$props, "disabled", 3, false), readonly = prop($$props, "readonly", 3, false), required = prop($$props, "required", 3, false), step = prop($$props, "step", 3, 1), className = prop($$props, "class", 3, "");
  let inputRef = /* @__PURE__ */ state(null);
  function handleInput(event2) {
    const target = event2.target;
    value(parseFloat(target.value) || 0);
    $$props.oninput?.(value());
  }
  function handleChange(event2) {
    const target = event2.target;
    value(parseFloat(target.value) || 0);
    $$props.onchange?.(value());
  }
  function roundToPrecision(num, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
  }
  function getDecimalPlaces(num) {
    const str = num.toString();
    const decimal = str.indexOf(".");
    return decimal === -1 ? 0 : str.length - decimal - 1;
  }
  function increment2() {
    if (disabled() || readonly()) return;
    const precision = getDecimalPlaces(step());
    let newValue = roundToPrecision(value() + step(), precision);
    if ($$props.max !== void 0 && newValue > $$props.max) newValue = $$props.max;
    value(newValue);
    $$props.oninput?.(value());
    $$props.onchange?.(value());
  }
  function decrement() {
    if (disabled() || readonly()) return;
    const precision = getDecimalPlaces(step());
    let newValue = roundToPrecision(value() - step(), precision);
    if ($$props.min !== void 0 && newValue < $$props.min) newValue = $$props.min;
    value(newValue);
    $$props.oninput?.(value());
    $$props.onchange?.(value());
  }
  function handleKeydown(event2) {
    if (event2.key === "ArrowUp") {
      event2.preventDefault();
      increment2();
    } else if (event2.key === "ArrowDown") {
      event2.preventDefault();
      decrement();
    }
  }
  let sizeClass = /* @__PURE__ */ user_derived(() => $$props.size ? `wpea-input--${$$props.size}` : "");
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent_4 = ($$anchor2) => {
      var div = root_1$5();
      var node_1 = child(div);
      {
        var consequent_1 = ($$anchor3) => {
          var label_1 = root_2$2();
          var node_2 = child(label_1);
          {
            var consequent = ($$anchor4) => {
              var fragment_1 = comment();
              var node_3 = first_child(fragment_1);
              snippet(node_3, () => $$props.label);
              append($$anchor4, fragment_1);
            };
            var alternate = ($$anchor4) => {
              var text$1 = text();
              template_effect(() => set_text(text$1, $$props.label));
              append($$anchor4, text$1);
            };
            if_block(node_2, ($$render) => {
              if (isSnippet($$props.label)) $$render(consequent);
              else $$render(alternate, false);
            });
          }
          template_effect(() => set_attribute(label_1, "for", $$props.id));
          append($$anchor3, label_1);
        };
        if_block(node_1, ($$render) => {
          if ($$props.label) $$render(consequent_1);
        });
      }
      var div_1 = sibling(node_1, 2);
      var input = child(div_1);
      input.__input = handleInput;
      input.__change = handleChange;
      input.__keydown = handleKeydown;
      bind_this(input, ($$value) => set(inputRef, $$value), () => get(inputRef));
      var div_2 = sibling(input, 2);
      var button = child(div_2);
      button.__click = increment2;
      var button_1 = sibling(button, 2);
      button_1.__click = decrement;
      var node_4 = sibling(div_1, 2);
      {
        var consequent_3 = ($$anchor3) => {
          var span = root_5$2();
          var node_5 = child(span);
          {
            var consequent_2 = ($$anchor4) => {
              var fragment_3 = comment();
              var node_6 = first_child(fragment_3);
              snippet(node_6, () => $$props.help);
              append($$anchor4, fragment_3);
            };
            var alternate_1 = ($$anchor4) => {
              var text_1 = text();
              template_effect(() => set_text(text_1, $$props.help));
              append($$anchor4, text_1);
            };
            if_block(node_5, ($$render) => {
              if (isSnippet($$props.help)) $$render(consequent_2);
              else $$render(alternate_1, false);
            });
          }
          append($$anchor3, span);
        };
        if_block(node_4, ($$render) => {
          if ($$props.help) $$render(consequent_3);
        });
      }
      template_effect(() => {
        set_class(input, 1, `wpea-input ${get(sizeClass) ?? ""} ${className() ?? ""}`);
        set_style(input, $$props.style);
        set_attribute(input, "id", $$props.id);
        set_attribute(input, "name", $$props.name);
        set_attribute(input, "placeholder", $$props.placeholder);
        input.disabled = disabled();
        input.readOnly = readonly();
        input.required = required();
        set_attribute(input, "min", $$props.min);
        set_attribute(input, "max", $$props.max);
        set_attribute(input, "step", step());
        set_value(input, value());
        button.disabled = disabled() || readonly() || $$props.max !== void 0 && value() >= $$props.max;
        button_1.disabled = disabled() || readonly() || $$props.min !== void 0 && value() <= $$props.min;
      });
      append($$anchor2, div);
    };
    var alternate_2 = ($$anchor2) => {
      var div_3 = root_8$2();
      var input_1 = child(div_3);
      input_1.__input = handleInput;
      input_1.__change = handleChange;
      input_1.__keydown = handleKeydown;
      bind_this(input_1, ($$value) => set(inputRef, $$value), () => get(inputRef));
      var div_4 = sibling(input_1, 2);
      var button_2 = child(div_4);
      button_2.__click = increment2;
      var button_3 = sibling(button_2, 2);
      button_3.__click = decrement;
      template_effect(() => {
        set_class(input_1, 1, `wpea-input ${get(sizeClass) ?? ""} ${className() ?? ""}`);
        set_style(input_1, $$props.style);
        set_attribute(input_1, "id", $$props.id);
        set_attribute(input_1, "name", $$props.name);
        set_attribute(input_1, "placeholder", $$props.placeholder);
        input_1.disabled = disabled();
        input_1.readOnly = readonly();
        input_1.required = required();
        set_attribute(input_1, "min", $$props.min);
        set_attribute(input_1, "max", $$props.max);
        set_attribute(input_1, "step", step());
        set_value(input_1, value());
        button_2.disabled = disabled() || readonly() || $$props.max !== void 0 && value() >= $$props.max;
        button_3.disabled = disabled() || readonly() || $$props.min !== void 0 && value() <= $$props.min;
      });
      append($$anchor2, div_3);
    };
    if_block(node, ($$render) => {
      if ($$props.label || $$props.help) $$render(consequent_4);
      else $$render(alternate_2, false);
    });
  }
  append($$anchor, fragment);
  pop();
}
delegate(["input", "change", "keydown", "click"]);
var root$2 = /* @__PURE__ */ from_html(`<button><!></button>`);
function Button($$anchor, $$props) {
  let variant = prop($$props, "variant", 3, "primary"), disabled = prop($$props, "disabled", 3, false), type = prop($$props, "type", 3, "button"), className = prop($$props, "class", 3, "");
  let variantClass = /* @__PURE__ */ user_derived(() => variant() ? `wpea-btn--${variant()}` : "");
  let sizeClass = /* @__PURE__ */ user_derived(() => $$props.size ? `wpea-btn--${$$props.size}` : "");
  var button = root$2();
  button.__click = function(...$$args) {
    $$props.onclick?.apply(this, $$args);
  };
  var node = child(button);
  {
    var consequent = ($$anchor2) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      snippet(node_1, () => $$props.children);
      append($$anchor2, fragment);
    };
    if_block(node, ($$render) => {
      if ($$props.children) $$render(consequent);
    });
  }
  template_effect(() => {
    set_class(button, 1, `wpea-btn ${get(variantClass) ?? ""} ${get(sizeClass) ?? ""} ${className() ?? ""}`);
    set_style(button, $$props.style);
    set_attribute(button, "type", type());
    button.disabled = disabled();
  });
  append($$anchor, button);
}
delegate(["click"]);
var root_1$4 = /* @__PURE__ */ from_html(`<label><!></label>`);
var root_4$2 = /* @__PURE__ */ from_html(`<span class="wpea-help"><!></span>`);
var root$1 = /* @__PURE__ */ from_html(`<div><label><input type="checkbox"/> <span class="wpea-switch__slider"></span></label> <!> <!></div>`);
function Switch($$anchor, $$props) {
  push($$props, true);
  let checked = prop($$props, "checked", 15, false), disabled = prop($$props, "disabled", 3, false), className = prop($$props, "class", 3, "");
  function handleChange(event2) {
    const target = event2.target;
    checked(target.checked);
    $$props.onchange?.(checked());
  }
  let sizeClass = /* @__PURE__ */ user_derived(() => $$props.size ? `wpea-switch--${$$props.size}` : "");
  let colorClass = /* @__PURE__ */ user_derived(() => $$props.color ? `wpea-switch--${$$props.color}` : "");
  var div = root$1();
  var label_1 = child(div);
  var input = child(label_1);
  input.__change = handleChange;
  var node = sibling(label_1, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var label_2 = root_1$4();
      var node_1 = child(label_2);
      {
        var consequent = ($$anchor3) => {
          var fragment = comment();
          var node_2 = first_child(fragment);
          snippet(node_2, () => $$props.label);
          append($$anchor3, fragment);
        };
        var alternate = ($$anchor3) => {
          var text$1 = text();
          template_effect(() => set_text(text$1, $$props.label));
          append($$anchor3, text$1);
        };
        if_block(node_1, ($$render) => {
          if (isSnippet($$props.label)) $$render(consequent);
          else $$render(alternate, false);
        });
      }
      template_effect(() => set_attribute(label_2, "for", $$props.id));
      append($$anchor2, label_2);
    };
    if_block(node, ($$render) => {
      if ($$props.label) $$render(consequent_1);
    });
  }
  var node_3 = sibling(node, 2);
  {
    var consequent_3 = ($$anchor2) => {
      var span = root_4$2();
      var node_4 = child(span);
      {
        var consequent_2 = ($$anchor3) => {
          var fragment_2 = comment();
          var node_5 = first_child(fragment_2);
          snippet(node_5, () => $$props.help);
          append($$anchor3, fragment_2);
        };
        var alternate_1 = ($$anchor3) => {
          var text_1 = text();
          template_effect(() => set_text(text_1, $$props.help));
          append($$anchor3, text_1);
        };
        if_block(node_4, ($$render) => {
          if (isSnippet($$props.help)) $$render(consequent_2);
          else $$render(alternate_1, false);
        });
      }
      append($$anchor2, span);
    };
    if_block(node_3, ($$render) => {
      if ($$props.help) $$render(consequent_3);
    });
  }
  template_effect(() => {
    set_class(div, 1, `wpea-control ${className() ?? ""}`);
    set_style(div, $$props.style);
    set_class(label_1, 1, `wpea-switch ${get(sizeClass) ?? ""} ${get(colorClass) ?? ""}`);
    set_attribute(label_1, "for", $$props.id);
    set_attribute(input, "id", $$props.id);
    input.disabled = disabled();
    set_checked(input, checked());
  });
  append($$anchor, div);
  pop();
}
delegate(["change"]);
var root_2$1 = /* @__PURE__ */ from_html(`<label class="wpea-label"><!></label>`);
var root_5$1 = /* @__PURE__ */ from_html(`<span class="wpea-help"><!></span>`);
var root_1$3 = /* @__PURE__ */ from_html(`<div class="wpea-field"><!> <textarea></textarea> <!></div>`);
var root_8$1 = /* @__PURE__ */ from_html(`<textarea></textarea>`);
function Textarea($$anchor, $$props) {
  push($$props, true);
  let value = prop($$props, "value", 15, ""), disabled = prop($$props, "disabled", 3, false), readonly = prop($$props, "readonly", 3, false), required = prop($$props, "required", 3, false), rows = prop($$props, "rows", 3, 4), className = prop($$props, "class", 3, "");
  function handleInput(event2) {
    const target = event2.target;
    value(target.value);
    $$props.oninput?.(value());
  }
  function handleChange(event2) {
    const target = event2.target;
    value(target.value);
    $$props.onchange?.(value());
  }
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent_4 = ($$anchor2) => {
      var div = root_1$3();
      var node_1 = child(div);
      {
        var consequent_1 = ($$anchor3) => {
          var label_1 = root_2$1();
          var node_2 = child(label_1);
          {
            var consequent = ($$anchor4) => {
              var fragment_1 = comment();
              var node_3 = first_child(fragment_1);
              snippet(node_3, () => $$props.label);
              append($$anchor4, fragment_1);
            };
            var alternate = ($$anchor4) => {
              var text$1 = text();
              template_effect(() => set_text(text$1, $$props.label));
              append($$anchor4, text$1);
            };
            if_block(node_2, ($$render) => {
              if (isSnippet($$props.label)) $$render(consequent);
              else $$render(alternate, false);
            });
          }
          template_effect(() => set_attribute(label_1, "for", $$props.id));
          append($$anchor3, label_1);
        };
        if_block(node_1, ($$render) => {
          if ($$props.label) $$render(consequent_1);
        });
      }
      var textarea = sibling(node_1, 2);
      textarea.__input = handleInput;
      textarea.__change = handleChange;
      var node_4 = sibling(textarea, 2);
      {
        var consequent_3 = ($$anchor3) => {
          var span = root_5$1();
          var node_5 = child(span);
          {
            var consequent_2 = ($$anchor4) => {
              var fragment_3 = comment();
              var node_6 = first_child(fragment_3);
              snippet(node_6, () => $$props.help);
              append($$anchor4, fragment_3);
            };
            var alternate_1 = ($$anchor4) => {
              var text_1 = text();
              template_effect(() => set_text(text_1, $$props.help));
              append($$anchor4, text_1);
            };
            if_block(node_5, ($$render) => {
              if (isSnippet($$props.help)) $$render(consequent_2);
              else $$render(alternate_1, false);
            });
          }
          append($$anchor3, span);
        };
        if_block(node_4, ($$render) => {
          if ($$props.help) $$render(consequent_3);
        });
      }
      template_effect(() => {
        set_class(textarea, 1, `wpea-textarea ${className() ?? ""}`);
        set_style(textarea, $$props.style);
        set_attribute(textarea, "id", $$props.id);
        set_attribute(textarea, "name", $$props.name);
        set_attribute(textarea, "placeholder", $$props.placeholder);
        textarea.disabled = disabled();
        textarea.readOnly = readonly();
        textarea.required = required();
        set_attribute(textarea, "rows", rows());
        set_value(textarea, value());
      });
      append($$anchor2, div);
    };
    var alternate_2 = ($$anchor2) => {
      var textarea_1 = root_8$1();
      textarea_1.__input = handleInput;
      textarea_1.__change = handleChange;
      template_effect(() => {
        set_class(textarea_1, 1, `wpea-textarea ${className() ?? ""}`);
        set_style(textarea_1, $$props.style);
        set_attribute(textarea_1, "id", $$props.id);
        set_attribute(textarea_1, "name", $$props.name);
        set_attribute(textarea_1, "placeholder", $$props.placeholder);
        textarea_1.disabled = disabled();
        textarea_1.readOnly = readonly();
        textarea_1.required = required();
        set_attribute(textarea_1, "rows", rows());
        set_value(textarea_1, value());
      });
      append($$anchor2, textarea_1);
    };
    if_block(node, ($$render) => {
      if ($$props.label || $$props.help) $$render(consequent_4);
      else $$render(alternate_2, false);
    });
  }
  append($$anchor, fragment);
  pop();
}
delegate(["input", "change"]);
var root_1$2 = /* @__PURE__ */ from_html(`<label class="wpea-label"><!></label>`);
var root_4$1 = /* @__PURE__ */ from_html(`<span class="wpea-multiselect__tag"><span class="wpea-multiselect__tag-label"><!></span> <button type="button" class="wpea-multiselect__tag-remove" tabindex="-1"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg></button></span>`);
var root_7$2 = /* @__PURE__ */ from_html(`<input type="text" class="wpea-multiselect__input"/>`);
var root_9 = /* @__PURE__ */ from_html(`<span class="wpea-multiselect__placeholder"> </span>`);
var root_10$1 = /* @__PURE__ */ from_html(`<button type="button" class="wpea-multiselect__clear" tabindex="-1" aria-label="Clear all"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg></button>`);
var root_15 = /* @__PURE__ */ from_svg(`<svg class="wpea-multiselect__option-check" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11.5 4L5.5 10L2.5 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
var root_12$1 = /* @__PURE__ */ from_html(`<div role="option" tabindex="-1"><!> <!></div>`);
var root_16 = /* @__PURE__ */ from_html(`<div class="wpea-multiselect__no-options">No options</div>`);
var root_11$1 = /* @__PURE__ */ from_html(`<div class="wpea-multiselect__menu" role="listbox" aria-multiselectable="true"><div class="wpea-multiselect__menu-list"></div></div>`);
var root_17$1 = /* @__PURE__ */ from_html(`<span class="wpea-help"><!></span>`);
var root = /* @__PURE__ */ from_html(`<div><!> <div><div class="wpea-multiselect__control" role="combobox" aria-haspopup="listbox"><div class="wpea-multiselect__value-container"><!> <!></div> <div class="wpea-multiselect__indicators"><!> <span class="wpea-multiselect__separator"></span> <span class="wpea-multiselect__dropdown-indicator"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></span></div></div> <!></div> <!></div>`);
function MultiSelect($$anchor, $$props) {
  push($$props, true);
  let value = prop($$props, "value", 31, () => proxy([])), options = prop($$props, "options", 19, () => []), placeholder = prop($$props, "placeholder", 3, "Select..."), disabled = prop($$props, "disabled", 3, false), searchable = prop($$props, "searchable", 3, true), clearable = prop($$props, "clearable", 3, true), className = prop($$props, "class", 3, "");
  let isOpen = /* @__PURE__ */ state(false);
  let searchQuery = /* @__PURE__ */ state("");
  let highlightedIndex = /* @__PURE__ */ state(-1);
  let containerRef;
  let searchInputRef = /* @__PURE__ */ state(null);
  const listboxId = `wpea-multiselect-listbox-${Math.random().toString(36).slice(2, 9)}`;
  function getSearchableLabel(opt) {
    return typeof opt.label === "string" ? opt.label : opt.value;
  }
  let filteredOptions = /* @__PURE__ */ user_derived(() => get(searchQuery) ? options().filter((opt) => getSearchableLabel(opt).toLowerCase().includes(get(searchQuery).toLowerCase()) && !opt.disabled) : options().filter((opt) => !opt.disabled));
  let selectedOptions = /* @__PURE__ */ user_derived(() => value().map((v) => options().find((o) => o.value === v)).filter(Boolean));
  let canAddMore = /* @__PURE__ */ user_derived(() => !$$props.maxItems || value().length < $$props.maxItems);
  function toggleDropdown() {
    if (disabled()) return;
    set(isOpen, !get(isOpen));
    if (get(isOpen)) {
      set(searchQuery, "");
      set(highlightedIndex, -1);
      setTimeout(() => get(searchInputRef)?.focus(), 10);
    }
  }
  function selectOption(option) {
    if (!get(canAddMore) && !value().includes(option.value)) return;
    if (value().includes(option.value)) {
      value(value().filter((v) => v !== option.value));
    } else {
      value([...value(), option.value]);
    }
    set(searchQuery, "");
    $$props.onchange?.(value());
  }
  function removeOption(optionValue, event2) {
    event2?.stopPropagation();
    value(value().filter((v) => v !== optionValue));
    $$props.onchange?.(value());
  }
  function clearAll(event2) {
    event2.stopPropagation();
    value([]);
    $$props.onchange?.(value());
  }
  function handleKeydown(event2) {
    switch (event2.key) {
      case "Escape":
        set(isOpen, false);
        break;
      case "ArrowDown":
        event2.preventDefault();
        if (!get(isOpen)) {
          set(isOpen, true);
        } else {
          set(highlightedIndex, Math.min(get(highlightedIndex) + 1, get(filteredOptions).length - 1), true);
        }
        break;
      case "ArrowUp":
        event2.preventDefault();
        set(highlightedIndex, Math.max(get(highlightedIndex) - 1, 0), true);
        break;
      case "Enter":
        event2.preventDefault();
        if (get(highlightedIndex) >= 0 && get(filteredOptions)[get(highlightedIndex)]) {
          selectOption(get(filteredOptions)[get(highlightedIndex)]);
        }
        break;
      case "Backspace":
        if (get(searchQuery) === "" && value().length > 0) {
          removeOption(value()[value().length - 1]);
        }
        break;
    }
  }
  function handleClickOutside(event2) {
    if (containerRef && !containerRef.contains(event2.target)) {
      set(isOpen, false);
    }
  }
  user_effect(() => {
    if (get(isOpen)) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  });
  let colorClass = /* @__PURE__ */ user_derived(() => $$props.color ? `wpea-multiselect--${$$props.color}` : "");
  var div = root();
  var node = child(div);
  {
    var consequent_1 = ($$anchor2) => {
      var label_1 = root_1$2();
      var node_1 = child(label_1);
      {
        var consequent = ($$anchor3) => {
          var fragment = comment();
          var node_2 = first_child(fragment);
          snippet(node_2, () => $$props.label);
          append($$anchor3, fragment);
        };
        var alternate = ($$anchor3) => {
          var text$1 = text();
          template_effect(() => set_text(text$1, $$props.label));
          append($$anchor3, text$1);
        };
        if_block(node_1, ($$render) => {
          if (isSnippet($$props.label)) $$render(consequent);
          else $$render(alternate, false);
        });
      }
      template_effect(() => set_attribute(label_1, "for", $$props.id));
      append($$anchor2, label_1);
    };
    if_block(node, ($$render) => {
      if ($$props.label) $$render(consequent_1);
    });
  }
  var div_1 = sibling(node, 2);
  let classes;
  var div_2 = child(div_1);
  div_2.__click = toggleDropdown;
  div_2.__keydown = handleKeydown;
  var div_3 = child(div_2);
  var node_3 = child(div_3);
  each(node_3, 17, () => get(selectedOptions), index, ($$anchor2, option) => {
    var span = root_4$1();
    var span_1 = child(span);
    var node_4 = child(span_1);
    {
      var consequent_2 = ($$anchor3) => {
        var fragment_2 = comment();
        var node_5 = first_child(fragment_2);
        snippet(node_5, () => get(option).label);
        append($$anchor3, fragment_2);
      };
      var alternate_1 = ($$anchor3) => {
        var text_1 = text();
        template_effect(() => set_text(text_1, get(option).label));
        append($$anchor3, text_1);
      };
      if_block(node_4, ($$render) => {
        if (isSnippet(get(option).label)) $$render(consequent_2);
        else $$render(alternate_1, false);
      });
    }
    var button = sibling(span_1, 2);
    button.__click = (e) => removeOption(get(option).value, e);
    template_effect(($0) => set_attribute(button, "aria-label", `Remove ${$0 ?? ""}`), [() => getSearchableLabel(get(option))]);
    append($$anchor2, span);
  });
  var node_6 = sibling(node_3, 2);
  {
    var consequent_3 = ($$anchor2) => {
      var input = root_7$2();
      input.__keydown = handleKeydown;
      input.__click = (e) => e.stopPropagation();
      bind_this(input, ($$value) => set(searchInputRef, $$value), () => get(searchInputRef));
      template_effect(() => {
        set_attribute(input, "placeholder", value().length === 0 ? placeholder() : "");
        input.disabled = disabled();
      });
      bind_value(input, () => get(searchQuery), ($$value) => set(searchQuery, $$value));
      append($$anchor2, input);
    };
    var alternate_2 = ($$anchor2) => {
      var fragment_4 = comment();
      var node_7 = first_child(fragment_4);
      {
        var consequent_4 = ($$anchor3) => {
          var span_2 = root_9();
          var text_2 = child(span_2);
          template_effect(() => set_text(text_2, placeholder()));
          append($$anchor3, span_2);
        };
        if_block(
          node_7,
          ($$render) => {
            if (value().length === 0) $$render(consequent_4);
          },
          true
        );
      }
      append($$anchor2, fragment_4);
    };
    if_block(node_6, ($$render) => {
      if (searchable() && get(isOpen)) $$render(consequent_3);
      else $$render(alternate_2, false);
    });
  }
  var div_4 = sibling(div_3, 2);
  var node_8 = child(div_4);
  {
    var consequent_5 = ($$anchor2) => {
      var button_1 = root_10$1();
      button_1.__click = clearAll;
      append($$anchor2, button_1);
    };
    if_block(node_8, ($$render) => {
      if (clearable() && value().length > 0) $$render(consequent_5);
    });
  }
  var node_9 = sibling(div_2, 2);
  {
    var consequent_8 = ($$anchor2) => {
      var div_5 = root_11$1();
      var div_6 = child(div_5);
      each(
        div_6,
        21,
        () => get(filteredOptions),
        index,
        ($$anchor3, option, i) => {
          var div_7 = root_12$1();
          let classes_1;
          div_7.__click = () => selectOption(get(option));
          div_7.__keydown = (e) => {
            if (e.key === "Enter" || e.key === " ") selectOption(get(option));
          };
          var node_10 = child(div_7);
          {
            var consequent_6 = ($$anchor4) => {
              var fragment_5 = comment();
              var node_11 = first_child(fragment_5);
              snippet(node_11, () => get(option).label);
              append($$anchor4, fragment_5);
            };
            var alternate_3 = ($$anchor4) => {
              var text_3 = text();
              template_effect(() => set_text(text_3, get(option).label));
              append($$anchor4, text_3);
            };
            if_block(node_10, ($$render) => {
              if (isSnippet(get(option).label)) $$render(consequent_6);
              else $$render(alternate_3, false);
            });
          }
          var node_12 = sibling(node_10, 2);
          {
            var consequent_7 = ($$anchor4) => {
              var svg = root_15();
              append($$anchor4, svg);
            };
            if_block(node_12, ($$render) => {
              if (value().includes(get(option).value)) $$render(consequent_7);
            });
          }
          template_effect(
            ($0, $1) => {
              classes_1 = set_class(div_7, 1, "wpea-multiselect__option", null, classes_1, $0);
              set_attribute(div_7, "aria-selected", $1);
            },
            [
              () => ({
                "wpea-multiselect__option--selected": value().includes(get(option).value),
                "wpea-multiselect__option--highlighted": i === get(highlightedIndex),
                "wpea-multiselect__option--disabled": !get(canAddMore) && !value().includes(get(option).value)
              }),
              () => value().includes(get(option).value)
            ]
          );
          event("mouseenter", div_7, () => set(highlightedIndex, i, true));
          append($$anchor3, div_7);
        },
        ($$anchor3) => {
          var div_8 = root_16();
          append($$anchor3, div_8);
        }
      );
      template_effect(() => set_attribute(div_5, "id", listboxId));
      append($$anchor2, div_5);
    };
    if_block(node_9, ($$render) => {
      if (get(isOpen)) $$render(consequent_8);
    });
  }
  bind_this(div_1, ($$value) => containerRef = $$value, () => containerRef);
  var node_13 = sibling(div_1, 2);
  {
    var consequent_10 = ($$anchor2) => {
      var span_3 = root_17$1();
      var node_14 = child(span_3);
      {
        var consequent_9 = ($$anchor3) => {
          var fragment_7 = comment();
          var node_15 = first_child(fragment_7);
          snippet(node_15, () => $$props.help);
          append($$anchor3, fragment_7);
        };
        var alternate_4 = ($$anchor3) => {
          var text_4 = text();
          template_effect(() => set_text(text_4, $$props.help));
          append($$anchor3, text_4);
        };
        if_block(node_14, ($$render) => {
          if (isSnippet($$props.help)) $$render(consequent_9);
          else $$render(alternate_4, false);
        });
      }
      append($$anchor2, span_3);
    };
    if_block(node_13, ($$render) => {
      if ($$props.help) $$render(consequent_10);
    });
  }
  template_effect(() => {
    set_class(div, 1, `wpea-field ${className() ?? ""}`);
    set_style(div, $$props.style);
    classes = set_class(div_1, 1, `wpea-multiselect ${get(colorClass) ?? ""}`, null, classes, {
      "wpea-multiselect--open": get(isOpen),
      "wpea-multiselect--disabled": disabled(),
      "wpea-multiselect--has-value": value().length > 0
    });
    set_attribute(div_2, "aria-controls", listboxId);
    set_attribute(div_2, "aria-expanded", get(isOpen));
    set_attribute(div_2, "tabindex", disabled() ? -1 : 0);
  });
  append($$anchor, div);
  pop();
}
delegate(["click", "keydown"]);
var root_2 = /* @__PURE__ */ from_html(`<div style="position: absolute; left: 50%; transform: translateX(-50%);"><button type="button" class="wpea-button wpea-button--secondary" style="padding: 4px 12px; font-size: 13px; min-width: 50px;"> </button></div>`);
var root_4 = /* @__PURE__ */ from_html(`<p class="wpea-text-muted wpea-text-sm">No meta queries added. Click "Add Meta Query" to add one.</p>`);
var root_7$1 = /* @__PURE__ */ from_html(`<input type="text" style="font-weight: 600; font-size: 14px; border: 1px solid var(--wpea-input--border); padding: 4px 8px; border-radius: 4px; background: var(--wpea-input--bg); color: var(--wpea-surface--text);"/>`);
var root_8 = /* @__PURE__ */ from_html(`<button type="button" style="font-weight: 600; font-size: 14px; cursor: pointer; padding: 4px 0; background: transparent; border: none; color: var(--wpea-surface--text); text-align: left;" title="Click to edit"> </button>`);
var root_6 = /* @__PURE__ */ from_html(`<div class="wpea-card"><div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 16px 0 16px;"><!> <!></div> <div style="padding: 16px;"><div class="wpea-grid-2 svelte-qhqlmy"><!> <!> <!> <!> <div style="grid-column: 1 / -1;"><!></div></div></div></div>`);
var root_1$1 = /* @__PURE__ */ from_html(`<div style="display: flex; justify-content: space-between; align-items: center; position: relative;"><h3 class="wpea-heading wpea-heading--sm">Meta Queries</h3> <!> <!></div> <!>`, 1);
function MetaQueryRepeater($$anchor, $$props) {
  push($$props, true);
  let metaQueries = prop($$props, "metaQueries", 31, () => proxy([])), relation = prop($$props, "relation", 15, "AND");
  let editingTitleIndex = /* @__PURE__ */ state(null);
  let titleInputRef = /* @__PURE__ */ state(null);
  user_effect(() => {
    if (get(editingTitleIndex) !== null && get(titleInputRef)) {
      get(titleInputRef).focus();
    }
  });
  const compareOptions = [
    { value: "=", label: "=" },
    { value: "!=", label: "!=" },
    { value: ">", label: ">" },
    { value: ">=", label: ">=" },
    { value: "<", label: "<" },
    { value: "<=", label: "<=" },
    { value: "LIKE", label: "LIKE" },
    { value: "NOT LIKE", label: "NOT LIKE" },
    { value: "IN", label: "IN" },
    { value: "NOT IN", label: "NOT IN" },
    { value: "BETWEEN", label: "BETWEEN" },
    { value: "NOT BETWEEN", label: "NOT BETWEEN" },
    { value: "EXISTS", label: "EXISTS" },
    { value: "NOT EXISTS", label: "NOT EXISTS" }
  ];
  const typeOptions = [
    { value: "CHAR", label: "CHAR" },
    { value: "NUMERIC", label: "NUMERIC" },
    { value: "BINARY", label: "BINARY" },
    { value: "DATE", label: "DATE" },
    { value: "DATETIME", label: "DATETIME" },
    { value: "DECIMAL", label: "DECIMAL" },
    { value: "SIGNED", label: "SIGNED" },
    { value: "UNSIGNED", label: "UNSIGNED" }
  ];
  function addMetaQuery() {
    metaQueries([
      ...metaQueries(),
      {
        key: "",
        value: "",
        compare: "=",
        type: "CHAR",
        clauseName: "",
        title: ""
      }
    ]);
    $$props.onUpdate(metaQueries());
  }
  function removeMetaQuery(index2) {
    metaQueries(metaQueries().filter((_, i) => i !== index2));
    $$props.onUpdate(metaQueries());
  }
  function updateMetaQuery(index2, field, value) {
    metaQueries(metaQueries()[index2][field] = value, true);
    $$props.onUpdate(metaQueries());
  }
  function startEditingTitle(index2) {
    set(editingTitleIndex, index2, true);
  }
  function finishEditingTitle(index2) {
    set(editingTitleIndex, null);
    $$props.onUpdate(metaQueries());
  }
  function handleTitleKeydown(event2, index2) {
    if (event2.key === "Enter") {
      finishEditingTitle();
    } else if (event2.key === "Escape") {
      set(editingTitleIndex, null);
    }
  }
  Stack($$anchor, {
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = root_1$1();
      var div = first_child(fragment_1);
      var node = sibling(child(div), 2);
      {
        var consequent = ($$anchor3) => {
          var div_1 = root_2();
          var button = child(div_1);
          button.__click = () => relation(relation() === "AND" ? "OR" : "AND");
          var text2 = child(button);
          template_effect(() => set_text(text2, relation()));
          append($$anchor3, div_1);
        };
        if_block(node, ($$render) => {
          if (metaQueries().length > 1) $$render(consequent);
        });
      }
      var node_1 = sibling(node, 2);
      Button(node_1, {
        variant: "secondary",
        size: "s",
        onclick: addMetaQuery,
        children: ($$anchor3, $$slotProps2) => {
          var text_1 = text("Add Meta Query");
          append($$anchor3, text_1);
        },
        $$slots: { default: true }
      });
      var node_2 = sibling(div, 2);
      {
        var consequent_1 = ($$anchor3) => {
          var p = root_4();
          append($$anchor3, p);
        };
        var alternate_1 = ($$anchor3) => {
          var fragment_2 = comment();
          var node_3 = first_child(fragment_2);
          each(node_3, 17, metaQueries, index, ($$anchor4, query, index2) => {
            var div_2 = root_6();
            var div_3 = child(div_2);
            var node_4 = child(div_3);
            {
              var consequent_2 = ($$anchor5) => {
                var input = root_7$1();
                input.__keydown = (e) => handleTitleKeydown(e);
                set_attribute(input, "placeholder", `Meta Query #${index2 + 1}`);
                bind_this(input, ($$value) => set(titleInputRef, $$value), () => get(titleInputRef));
                event("blur", input, () => finishEditingTitle());
                bind_value(input, () => get(query).title, ($$value) => get(query).title = $$value);
                append($$anchor5, input);
              };
              var alternate = ($$anchor5) => {
                var button_1 = root_8();
                button_1.__click = () => startEditingTitle(index2);
                var text_2 = child(button_1);
                template_effect(() => set_text(text_2, get(query).title || `Meta Query #${index2 + 1}`));
                append($$anchor5, button_1);
              };
              if_block(node_4, ($$render) => {
                if (get(editingTitleIndex) === index2) $$render(consequent_2);
                else $$render(alternate, false);
              });
            }
            var node_5 = sibling(node_4, 2);
            Button(node_5, {
              variant: "ghost",
              size: "s",
              onclick: () => removeMetaQuery(index2),
              children: ($$anchor5, $$slotProps2) => {
                var text_3 = text("Remove");
                append($$anchor5, text_3);
              },
              $$slots: { default: true }
            });
            var div_4 = sibling(div_3, 2);
            var div_5 = child(div_4);
            var node_6 = child(div_5);
            Input(node_6, {
              id: `meta-key-${index2}`,
              label: "Meta Key",
              onchange: () => updateMetaQuery(index2, "key", get(query).key),
              placeholder: "e.g. _custom_field",
              get value() {
                return get(query).key;
              },
              set value($$value) {
                get(query).key = $$value;
              }
            });
            var node_7 = sibling(node_6, 2);
            Input(node_7, {
              id: `meta-value-${index2}`,
              label: "Meta Value",
              onchange: () => updateMetaQuery(index2, "value", get(query).value),
              placeholder: "e.g. some value",
              get value() {
                return get(query).value;
              },
              set value($$value) {
                get(query).value = $$value;
              }
            });
            var node_8 = sibling(node_7, 2);
            AdvancedSelect(node_8, {
              id: `meta-compare-${index2}`,
              label: "Compare",
              onchange: () => updateMetaQuery(index2, "compare", get(query).compare),
              get options() {
                return compareOptions;
              },
              multiple: false,
              searchable: false,
              clearable: false,
              get value() {
                return get(query).compare;
              },
              set value($$value) {
                get(query).compare = $$value;
              }
            });
            var node_9 = sibling(node_8, 2);
            AdvancedSelect(node_9, {
              id: `meta-type-${index2}`,
              label: "Type",
              onchange: () => updateMetaQuery(index2, "type", get(query).type),
              get options() {
                return typeOptions;
              },
              multiple: false,
              searchable: false,
              clearable: false,
              get value() {
                return get(query).type;
              },
              set value($$value) {
                get(query).type = $$value;
              }
            });
            var div_6 = sibling(node_9, 2);
            var node_10 = child(div_6);
            Input(node_10, {
              id: `meta-clause-${index2}`,
              label: "Clause Name",
              onchange: () => updateMetaQuery(index2, "clauseName", get(query).clauseName),
              placeholder: "e.g. price_clause",
              help: "Set clause name to be used as 'Order by' parameter.",
              get value() {
                return get(query).clauseName;
              },
              set value($$value) {
                get(query).clauseName = $$value;
              }
            });
            append($$anchor4, div_2);
          });
          append($$anchor3, fragment_2);
        };
        if_block(node_2, ($$render) => {
          if (metaQueries().length === 0) $$render(consequent_1);
          else $$render(alternate_1, false);
        });
      }
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  pop();
}
delegate(["click", "keydown"]);
var root_5 = /* @__PURE__ */ from_html(`<!> <!> <!>`, 1);
var root_7 = /* @__PURE__ */ from_html(`<div class="wpea-grid-2 svelte-15s92sb"><!> <!></div>`);
var root_11 = /* @__PURE__ */ from_html(`<div class="wpea-grid-2 svelte-15s92sb"><!></div>`);
var root_10 = /* @__PURE__ */ from_html(`<div class="wpea-grid-3 svelte-15s92sb"><!> <!> <!> <!></div> <!> <div class="wpea-grid-2 svelte-15s92sb"><!> <!></div>`, 1);
var root_13 = /* @__PURE__ */ from_html(`<div class="wpea-grid-2 svelte-15s92sb"><!> <!></div>`);
var root_14 = /* @__PURE__ */ from_html(`<p class="wpea-text-muted wpea-text-sm">Filter posts by taxonomies.</p> <div class="wpea-grid-2 svelte-15s92sb"><!> <!></div>`, 1);
var root_12 = /* @__PURE__ */ from_html(`<!> <!> <!>`, 1);
var root_17 = /* @__PURE__ */ from_html(`<div class="wpea-grid-2 svelte-15s92sb"><!> <!></div>`);
var root_3 = /* @__PURE__ */ from_html(`<!> <!> <!> <!>`, 1);
var root_21 = /* @__PURE__ */ from_html(`<p class="wpea-text-muted wpea-text-sm">Edit the generated WP_Query JSON below. This will be used to fetch items.</p> <!>`, 1);
var root_25 = /* @__PURE__ */ from_html(`<p class="wpea-text-muted">Loading results...</p>`);
var root_27 = /* @__PURE__ */ from_html(`<p class="wpea-text-danger"> </p>`);
var root_30 = /* @__PURE__ */ from_html(`<p class="wpea-text-muted">No results yet. Switch to this tab after creating a query.</p>`);
var root_1 = /* @__PURE__ */ from_html(`<div class="wpea-tabs"><div class="wpea-tabs__list" role="tablist"><button class="wpea-tabs__tab" role="tab">Builder</button> <button class="wpea-tabs__tab" role="tab">WP_Query</button> <button class="wpea-tabs__tab" role="tab">Results</button></div></div> <!>`, 1);
var root_31 = /* @__PURE__ */ from_html(`<div style="display: flex; justify-content: space-between; width: 100%;"><div><!></div> <div style="display: flex; gap: var(--wpea-space--sm);"><!> <!></div></div>`);
function QueryBuilderModal($$anchor, $$props) {
  push($$props, true);
  let open = prop($$props, "open", 15, false), initialConfig = prop($$props, "initialConfig", 3, null);
  const { apiUrl, nonce } = window.abMenuQueriesData;
  let queryType = /* @__PURE__ */ state("post");
  let postType = /* @__PURE__ */ state("post");
  let taxonomy = /* @__PURE__ */ state("category");
  let orderBy = /* @__PURE__ */ state("title");
  let order = /* @__PURE__ */ state("ASC");
  let postCount = /* @__PURE__ */ state(-1);
  let offset = /* @__PURE__ */ state(0);
  let childOf = /* @__PURE__ */ state(0);
  let includeChildren = /* @__PURE__ */ state(false);
  let includeParentItem = /* @__PURE__ */ state(false);
  let hierarchical = /* @__PURE__ */ state(false);
  let showLabelOnEmpty = /* @__PURE__ */ state(false);
  let emptyLabel = /* @__PURE__ */ state("");
  let showDefaultMenuItem = /* @__PURE__ */ state(false);
  let includePosts = /* @__PURE__ */ state(proxy([]));
  let excludePosts = /* @__PURE__ */ state(proxy([]));
  let includeTerms = /* @__PURE__ */ state(proxy([]));
  let excludeTerms = /* @__PURE__ */ state(proxy([]));
  let includeTaxonomies = /* @__PURE__ */ state(proxy([]));
  let excludeTaxonomies = /* @__PURE__ */ state(proxy([]));
  let metaQueries = /* @__PURE__ */ state(proxy([]));
  let metaQueryRelation = /* @__PURE__ */ state("AND");
  let activeTab = /* @__PURE__ */ state("builder");
  let rawWPQuery = /* @__PURE__ */ state("");
  let showResetConfirm = /* @__PURE__ */ state(false);
  let queryResults = /* @__PURE__ */ state("");
  let isLoadingResults = /* @__PURE__ */ state(false);
  let resultsError = /* @__PURE__ */ state("");
  user_effect(() => {
    if (open()) {
      if (initialConfig()) {
        if (initialConfig().rawWPQuery) {
          isInitialLoad = true;
          try {
            const parsed = JSON.parse(initialConfig().rawWPQuery);
            set(rawWPQuery, JSON.stringify(parsed, null, 2), true);
          } catch (e) {
            set(rawWPQuery, initialConfig().rawWPQuery, true);
          }
          setTimeout(
            () => {
              isInitialLoad = false;
            },
            150
          );
        } else {
          set(queryType, initialConfig().queryType || "post", true);
          set(postType, initialConfig().postType || "post", true);
          set(taxonomy, initialConfig().taxonomy || "category", true);
          set(orderBy, initialConfig().orderBy || "title", true);
          set(order, initialConfig().order || "ASC", true);
          set(
            postCount,
            typeof initialConfig().postCount === "string" ? parseInt(initialConfig().postCount, 10) : initialConfig().postCount ?? -1,
            true
          );
          set(
            offset,
            typeof initialConfig().offset === "string" ? parseInt(initialConfig().offset, 10) : initialConfig().offset || 0,
            true
          );
          set(
            childOf,
            typeof initialConfig().childOf === "string" ? parseInt(initialConfig().childOf, 10) : initialConfig().childOf || 0,
            true
          );
          set(includeChildren, initialConfig().includeChildren ?? false, true);
          set(includeParentItem, initialConfig().includeParentItem ?? false, true);
          set(hierarchical, initialConfig().hierarchical ?? false, true);
          set(showLabelOnEmpty, initialConfig().showLabelOnEmpty ?? false, true);
          set(emptyLabel, initialConfig().emptyLabel || "", true);
          set(showDefaultMenuItem, initialConfig().showDefaultMenuItem ?? false, true);
          set(includePosts, (initialConfig().includePosts || []).map(String), true);
          set(excludePosts, (initialConfig().excludePosts || []).map(String), true);
          set(includeTerms, (initialConfig().includeTerms || []).map(String), true);
          set(excludeTerms, (initialConfig().excludeTerms || []).map(String), true);
          set(includeTaxonomies, (initialConfig().includeTaxonomies || []).map(String), true);
          set(excludeTaxonomies, (initialConfig().excludeTaxonomies || []).map(String), true);
          set(metaQueries, initialConfig().metaQueries || [], true);
          set(metaQueryRelation, initialConfig().metaQueryRelation || "AND", true);
          set(rawWPQuery, "");
          setTimeout(
            () => {
              generateWPQuery(true);
            },
            500
          );
        }
      } else {
        set(queryType, "post");
        set(postType, "post");
        set(taxonomy, "category");
        set(orderBy, "title");
        set(order, "ASC");
        set(postCount, -1);
        set(offset, 0);
        set(childOf, 0);
        set(includeChildren, false);
        set(includeParentItem, false);
        set(hierarchical, false);
        set(showLabelOnEmpty, false);
        set(emptyLabel, "");
        set(showDefaultMenuItem, false);
        set(includePosts, [], true);
        set(excludePosts, [], true);
        set(includeTerms, [], true);
        set(excludeTerms, [], true);
        set(includeTaxonomies, [], true);
        set(excludeTaxonomies, [], true);
        set(metaQueries, [], true);
        set(metaQueryRelation, "AND");
        set(rawWPQuery, "");
      }
      set(activeTab, "builder");
    }
  });
  let isUpdatingFromUI = false;
  let isUpdatingFromQuery = false;
  let isInitialLoad = false;
  function parseWPQueryToUI(queryJson) {
    if (!queryJson || isUpdatingFromUI) return;
    isUpdatingFromQuery = true;
    try {
      const args = JSON.parse(queryJson);
      if (args.taxonomy) {
        set(queryType, "taxonomy");
        set(taxonomy, args.taxonomy || "category", true);
        set(postCount, args.number ?? -1, true);
        if (args.child_of) {
          set(childOf, args.child_of, true);
          set(includeChildren, true);
        } else if (args.parent) {
          set(childOf, args.parent, true);
          set(includeChildren, false);
        } else {
          set(childOf, 0);
        }
        set(includeTerms, (args.include || []).map(String), true);
        set(excludeTerms, (args.exclude || []).map(String), true);
      } else {
        set(queryType, "post");
        set(postType, args.post_type || "post", true);
        set(postCount, args.posts_per_page ?? -1, true);
        if (args.post_parent) {
          set(childOf, args.post_parent, true);
        } else {
          set(childOf, 0);
        }
        set(includePosts, (args.post__in || []).map(String), true);
        set(excludePosts, (args.post__not_in || []).map(String), true);
        if (args.tax_query && Array.isArray(args.tax_query)) {
          const includeQuery = args.tax_query.find((q) => q.operator === "IN");
          const excludeQuery = args.tax_query.find((q) => q.operator === "NOT IN");
          if (includeQuery) {
            set(includeTaxonomies, (includeQuery.terms || []).map(String), true);
            if (includeQuery.taxonomy) set(taxonomy, includeQuery.taxonomy, true);
          }
          if (excludeQuery) {
            set(excludeTaxonomies, (excludeQuery.terms || []).map(String), true);
          }
        }
        if (args.meta_query) {
          if (Array.isArray(args.meta_query)) {
            set(
              metaQueries,
              args.meta_query.filter((mq) => mq.key).map((mq, idx) => ({
                key: mq.key || "",
                value: mq.value || "",
                compare: mq.compare || "=",
                type: mq.type || "CHAR",
                clauseName: mq.clauseName || `clause_${idx + 1}`,
                title: mq.title || ""
              })),
              true
            );
            const relationItem = args.meta_query.find((item) => item.relation);
            if (relationItem) {
              set(metaQueryRelation, relationItem.relation === "OR" ? "OR" : "AND", true);
            }
          } else if (typeof args.meta_query === "object") {
            set(metaQueryRelation, args.meta_query.relation || "AND", true);
            set(
              metaQueries,
              Object.keys(args.meta_query).filter((key) => !isNaN(Number(key))).map((key, idx) => {
                const mq = args.meta_query[key];
                return {
                  key: mq.key || "",
                  value: mq.value || "",
                  compare: mq.compare || "=",
                  type: mq.type || "CHAR",
                  clauseName: mq.clauseName || `clause_${idx + 1}`,
                  title: mq.title || ""
                };
              }),
              true
            );
          }
        }
      }
      set(offset, args.offset || 0, true);
      set(orderBy, args.orderby || "title", true);
      set(order, args.order || "ASC", true);
      set(includeChildren, args.include_children ?? false, true);
      set(hierarchical, args.hierarchical ?? false, true);
      set(includeParentItem, args.includeParentItem ?? false, true);
      set(showLabelOnEmpty, args.showLabelOnEmpty ?? false, true);
      set(emptyLabel, args.emptyLabel || "", true);
      set(showDefaultMenuItem, args.showDefaultMenuItem ?? false, true);
    } catch (e) {
    } finally {
      setTimeout(
        () => {
          isUpdatingFromQuery = false;
          isInitialLoad = false;
        },
        100
      );
    }
  }
  user_effect(() => {
    if (get(rawWPQuery) && !isUpdatingFromUI) {
      parseWPQueryToUI(get(rawWPQuery));
    }
  });
  let postTypeOptions = /* @__PURE__ */ state(proxy([]));
  let taxonomyOptions = /* @__PURE__ */ state(proxy([]));
  let postOptions = /* @__PURE__ */ state(proxy([]));
  let termOptions = /* @__PURE__ */ state(proxy([]));
  const queryTypeOptions = [
    { value: "post", label: "Post" },
    { value: "taxonomy", label: "Taxonomy" }
  ];
  const orderByOptions = [
    { value: "title", label: "Title" },
    { value: "date", label: "Date" },
    { value: "modified", label: "Modified" },
    { value: "menu_order", label: "Menu Order" },
    { value: "ID", label: "ID" },
    { value: "author", label: "Author" },
    { value: "name", label: "Name (Slug)" },
    { value: "rand", label: "Random" }
  ];
  const orderOptions = [
    { value: "ASC", label: "Ascending" },
    { value: "DESC", label: "Descending" }
  ];
  user_effect(() => {
    if (open()) {
      fetchPostTypes();
      fetchTaxonomies();
    }
  });
  user_effect(() => {
    if (get(queryType) === "post" && get(postType)) {
      fetchPosts();
    }
  });
  user_effect(() => {
    if (get(taxonomy)) {
      fetchTerms();
    }
  });
  async function fetchPostTypes() {
    try {
      const response = await fetch(`${apiUrl}/menu-queries/post-types`, { headers: { "X-WP-Nonce": nonce } });
      set(postTypeOptions, await response.json(), true);
    } catch (error) {
      console.error("Failed to fetch post types:", error);
    }
  }
  async function fetchTaxonomies() {
    try {
      const response = await fetch(`${apiUrl}/menu-queries/taxonomies`, { headers: { "X-WP-Nonce": nonce } });
      set(taxonomyOptions, await response.json(), true);
    } catch (error) {
      console.error("Failed to fetch taxonomies:", error);
    }
  }
  async function fetchPosts() {
    try {
      const response = await fetch(`${apiUrl}/menu-queries/posts?post_type=${get(postType)}`, { headers: { "X-WP-Nonce": nonce } });
      set(postOptions, await response.json(), true);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  }
  async function fetchTerms() {
    try {
      const response = await fetch(`${apiUrl}/menu-queries/terms?taxonomy=${get(taxonomy)}`, { headers: { "X-WP-Nonce": nonce } });
      set(termOptions, await response.json(), true);
    } catch (error) {
      console.error("Failed to fetch terms:", error);
    }
  }
  function generateWPQuery(preserveCustomProperties = true) {
    if (isUpdatingFromQuery) {
      return;
    }
    isUpdatingFromUI = true;
    let existingCustomProps = {};
    if (preserveCustomProperties && get(rawWPQuery)) {
      try {
        const existing = JSON.parse(get(rawWPQuery));
        const knownProps = /* @__PURE__ */ new Set([
          // WP_Query properties (snake_case)
          "post_type",
          "posts_per_page",
          "offset",
          "orderby",
          "order",
          "include_children",
          "hierarchical",
          "post_parent",
          "post__in",
          "post__not_in",
          "tax_query",
          "meta_query",
          "taxonomy",
          "number",
          "child_of",
          "parent",
          "include",
          "exclude",
          // UI-only properties (camelCase) - should never be in WP_Query
          "queryType",
          "postType",
          "orderBy",
          "postCount",
          "childOf",
          "includeChildren",
          "includeParentItem",
          "showLabelOnEmpty",
          "emptyLabel",
          "showDefaultMenuItem",
          "includePosts",
          "excludePosts",
          "includeTerms",
          "excludeTerms",
          "includeTaxonomies",
          "excludeTaxonomies",
          "metaQueries",
          "metaQueryRelation"
        ]);
        Object.keys(existing).forEach((key) => {
          if (!knownProps.has(key)) {
            existingCustomProps[key] = existing[key];
          }
        });
      } catch (e) {
      }
    }
    const args = {};
    if (get(queryType) === "post") {
      args.post_type = get(postType);
      args.posts_per_page = get(postCount);
      if (get(offset) > 0) args.offset = get(offset);
      args.orderby = get(orderBy);
      args.order = get(order);
      if (get(includeChildren)) args.include_children = get(includeChildren);
      if (get(hierarchical)) args.hierarchical = get(hierarchical);
      if (get(childOf) > 0) {
        args.post_parent = get(childOf);
      }
      const includePostsFiltered = get(includePosts).map((id) => typeof id === "number" ? id : parseInt(id, 10)).filter((id) => !isNaN(id));
      if (includePostsFiltered.length > 0) {
        args.post__in = includePostsFiltered;
      }
      const excludePostsFiltered = get(excludePosts).map((id) => typeof id === "number" ? id : parseInt(id, 10)).filter((id) => !isNaN(id));
      if (excludePostsFiltered.length > 0) {
        args.post__not_in = excludePostsFiltered;
      }
      const includeTaxFiltered = get(includeTaxonomies).map((id) => typeof id === "number" ? id : parseInt(id, 10)).filter((id) => !isNaN(id));
      const excludeTaxFiltered = get(excludeTaxonomies).map((id) => typeof id === "number" ? id : parseInt(id, 10)).filter((id) => !isNaN(id));
      if (includeTaxFiltered.length > 0 || excludeTaxFiltered.length > 0) {
        args.tax_query = [];
        if (includeTaxFiltered.length > 0) {
          args.tax_query.push({
            taxonomy: get(taxonomy),
            field: "term_id",
            terms: includeTaxFiltered,
            operator: "IN"
          });
        }
        if (excludeTaxFiltered.length > 0) {
          args.tax_query.push({
            taxonomy: get(taxonomy),
            field: "term_id",
            terms: excludeTaxFiltered,
            operator: "NOT IN"
          });
        }
      }
      if (get(metaQueries).length > 0) {
        const validMetaQueries = get(metaQueries).filter((mq) => mq.key.trim() !== "" && mq.value.trim() !== "");
        if (validMetaQueries.length > 0) {
          args.meta_query = {
            ...validMetaQueries.reduce(
              (acc, mq, index2) => {
                acc[index2] = {
                  key: mq.key,
                  value: mq.value,
                  compare: mq.compare,
                  type: mq.type
                };
                if (mq.clauseName) {
                  acc[index2].clauseName = mq.clauseName;
                }
                if (mq.title) {
                  acc[index2].title = mq.title;
                }
                return acc;
              },
              {}
            )
          };
          if (validMetaQueries.length > 1) {
            args.meta_query.relation = get(metaQueryRelation);
          }
        }
      }
    } else {
      args.taxonomy = get(taxonomy);
      args.number = get(postCount);
      if (get(offset) > 0) args.offset = get(offset);
      args.orderby = get(orderBy);
      args.order = get(order);
      if (get(includeChildren)) args.include_children = get(includeChildren);
      if (get(hierarchical)) args.hierarchical = get(hierarchical);
      if (get(childOf) > 0) {
        if (get(includeChildren)) {
          args.child_of = get(childOf);
        } else {
          args.parent = get(childOf);
        }
      }
      const includeTermsFiltered = get(includeTerms).map((id) => typeof id === "number" ? id : parseInt(id, 10)).filter((id) => !isNaN(id));
      if (includeTermsFiltered.length > 0) args.include = includeTermsFiltered;
      const excludeTermsFiltered = get(excludeTerms).map((id) => typeof id === "number" ? id : parseInt(id, 10)).filter((id) => !isNaN(id));
      if (excludeTermsFiltered.length > 0) args.exclude = excludeTermsFiltered;
    }
    Object.assign(args, existingCustomProps);
    args.includeParentItem = get(includeParentItem);
    args.showLabelOnEmpty = get(showLabelOnEmpty);
    args.emptyLabel = get(emptyLabel);
    args.showDefaultMenuItem = get(showDefaultMenuItem);
    set(rawWPQuery, JSON.stringify(args, null, 2), true);
    setTimeout(
      () => {
        isUpdatingFromUI = false;
      },
      100
    );
  }
  let autoGenEnabled = false;
  let autoGenTimeout = null;
  user_effect(() => {
    if (open()) {
      if (autoGenTimeout) clearTimeout(autoGenTimeout);
      autoGenTimeout = window.setTimeout(
        () => {
          autoGenEnabled = true;
          autoGenTimeout = null;
        },
        300
      );
    } else {
      if (autoGenTimeout) {
        clearTimeout(autoGenTimeout);
        autoGenTimeout = null;
      }
      autoGenEnabled = false;
    }
  });
  let previousPostType = /* @__PURE__ */ state("");
  user_effect(() => {
    if (get(previousPostType) === "") {
      set(previousPostType, get(postType), true);
    } else if (get(postType) !== get(previousPostType) && !isInitialLoad && !isUpdatingFromQuery) {
      set(includePosts, [], true);
      set(excludePosts, [], true);
      set(previousPostType, get(postType), true);
    }
  });
  user_effect(() => {
    ({
      queryType: get(queryType),
      postType: get(postType),
      taxonomy: get(taxonomy),
      orderBy: get(orderBy),
      order: get(order),
      postCount: get(postCount),
      offset: get(offset),
      childOf: get(childOf),
      includeChildren: get(includeChildren),
      includeParentItem: get(includeParentItem),
      hierarchical: get(hierarchical),
      showLabelOnEmpty: get(showLabelOnEmpty),
      emptyLabel: get(emptyLabel),
      includePosts: get(includePosts),
      excludePosts: get(excludePosts),
      includeTerms: get(includeTerms),
      excludeTerms: get(excludeTerms),
      includeTaxonomies: get(includeTaxonomies),
      excludeTaxonomies: get(excludeTaxonomies),
      metaQueries: get(metaQueries)
    });
    if (autoGenEnabled && !isUpdatingFromQuery && !isInitialLoad) {
      generateWPQuery(true);
    }
  });
  function handleSubmit() {
    const config = {
      queryType: get(queryType),
      postType: get(postType),
      taxonomy: get(taxonomy),
      orderBy: get(orderBy),
      order: get(order),
      postCount: typeof get(postCount) === "string" ? parseInt(get(postCount), 10) : get(postCount),
      offset: typeof get(offset) === "string" ? parseInt(get(offset), 10) : get(offset),
      childOf: typeof get(childOf) === "string" ? parseInt(get(childOf), 10) : get(childOf),
      includeChildren: get(includeChildren),
      includeParentItem: get(includeParentItem),
      hierarchical: get(hierarchical),
      showLabelOnEmpty: get(showLabelOnEmpty),
      emptyLabel: get(emptyLabel),
      showDefaultMenuItem: get(showDefaultMenuItem),
      includePosts: get(includePosts).map((id) => parseInt(id, 10)).filter((id) => !isNaN(id)),
      excludePosts: get(excludePosts).map((id) => parseInt(id, 10)).filter((id) => !isNaN(id)),
      includeTerms: get(includeTerms).map((id) => parseInt(id, 10)).filter((id) => !isNaN(id)),
      excludeTerms: get(excludeTerms).map((id) => parseInt(id, 10)).filter((id) => !isNaN(id)),
      includeTaxonomies: get(includeTaxonomies).map((id) => parseInt(id, 10)).filter((id) => !isNaN(id)),
      excludeTaxonomies: get(excludeTaxonomies).map((id) => parseInt(id, 10)).filter((id) => !isNaN(id)),
      metaQueries: get(metaQueries),
      metaQueryRelation: get(metaQueryRelation),
      rawWPQuery: get(rawWPQuery) || void 0
    };
    $$props.onSubmit(config);
    $$props.onClose();
  }
  function handleMetaQueriesUpdate(queries) {
    set(metaQueries, queries, true);
  }
  let resetConfirmTimeout = null;
  function handleReset() {
    if (!get(showResetConfirm)) {
      set(showResetConfirm, true);
      resetConfirmTimeout = window.setTimeout(
        () => {
          set(showResetConfirm, false);
        },
        3e3
      );
    } else {
      if (resetConfirmTimeout) {
        clearTimeout(resetConfirmTimeout);
        resetConfirmTimeout = null;
      }
      set(showResetConfirm, false);
      autoGenEnabled = false;
      set(queryType, "post");
      set(postType, "post");
      set(taxonomy, "category");
      set(orderBy, "title");
      set(postCount, -1);
      set(offset, 0);
      set(childOf, 0);
      set(includeChildren, false);
      set(includeParentItem, false);
      set(hierarchical, false);
      set(showLabelOnEmpty, false);
      set(emptyLabel, "");
      set(includePosts, [], true);
      set(excludePosts, [], true);
      set(includeTerms, [], true);
      set(excludeTerms, [], true);
      set(includeTaxonomies, [], true);
      set(excludeTaxonomies, [], true);
      set(metaQueries, [], true);
      set(metaQueryRelation, "AND");
      set(rawWPQuery, "");
      setTimeout(
        () => {
          autoGenEnabled = true;
        },
        100
      );
    }
  }
  async function executeQuery() {
    if (!get(rawWPQuery)) {
      set(resultsError, "No query to execute");
      return;
    }
    set(isLoadingResults, true);
    set(resultsError, "");
    set(queryResults, "");
    try {
      const args = JSON.parse(get(rawWPQuery));
      const response = await fetch(`${apiUrl}/menu-queries/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-WP-Nonce": nonce },
        body: JSON.stringify({ args, query_type: get(queryType) })
      });
      const data = await response.json();
      if (data.success) {
        set(queryResults, JSON.stringify(data.data, null, 2), true);
      } else {
        set(resultsError, data.message || "Error executing query", true);
      }
    } catch (e) {
      set(resultsError, e.message || "Error executing query", true);
    } finally {
      set(isLoadingResults, false);
    }
  }
  user_effect(() => {
    if (get(activeTab) === "results" && get(rawWPQuery)) {
      executeQuery();
    }
  });
  let canSave = /* @__PURE__ */ user_derived(() => get(rawWPQuery).length > 0);
  {
    const children = ($$anchor2) => {
      var fragment_1 = root_1();
      var div = first_child(fragment_1);
      var div_1 = child(div);
      var button = child(div_1);
      button.__click = () => set(activeTab, "builder");
      var button_1 = sibling(button, 2);
      button_1.__click = () => set(activeTab, "query");
      var button_2 = sibling(button_1, 2);
      button_2.__click = () => set(activeTab, "results");
      var node = sibling(div, 2);
      {
        var consequent_4 = ($$anchor3) => {
          Stack($$anchor3, {
            children: ($$anchor4, $$slotProps) => {
              var fragment_3 = root_3();
              var node_1 = first_child(fragment_3);
              Card(node_1, {
                title: "Settings",
                children: ($$anchor5, $$slotProps2) => {
                  Stack($$anchor5, {
                    children: ($$anchor6, $$slotProps3) => {
                      var fragment_5 = root_5();
                      var node_2 = first_child(fragment_5);
                      Switch(node_2, {
                        id: "show-default-menu-item",
                        label: "Show Default Menu Item",
                        help: "When enabled, adds the default WP Menu Item with the generated menu as a sub-menu. When disabled, the generated menu replaces the default menu item.",
                        get checked() {
                          return get(showDefaultMenuItem);
                        },
                        set checked($$value) {
                          set(showDefaultMenuItem, $$value, true);
                        }
                      });
                      var node_3 = sibling(node_2, 2);
                      Switch(node_3, {
                        id: "show-label-on-empty",
                        label: "Show Label on Empty Result",
                        help: "Replaces the generated menu with the label text if there is no query result",
                        get checked() {
                          return get(showLabelOnEmpty);
                        },
                        set checked($$value) {
                          set(showLabelOnEmpty, $$value, true);
                        }
                      });
                      var node_4 = sibling(node_3, 2);
                      {
                        var consequent = ($$anchor7) => {
                          Input($$anchor7, {
                            id: "empty-label",
                            label: "Empty Label Text",
                            placeholder: "No items found",
                            get value() {
                              return get(emptyLabel);
                            },
                            set value($$value) {
                              set(emptyLabel, $$value, true);
                            }
                          });
                        };
                        if_block(node_4, ($$render) => {
                          if (get(showLabelOnEmpty)) $$render(consequent);
                        });
                      }
                      append($$anchor6, fragment_5);
                    },
                    $$slots: { default: true }
                  });
                },
                $$slots: { default: true }
              });
              var node_5 = sibling(node_1, 2);
              Card(node_5, {
                title: "Query Type",
                children: ($$anchor5, $$slotProps2) => {
                  var div_2 = root_7();
                  var node_6 = child(div_2);
                  AdvancedSelect(node_6, {
                    id: "query-type",
                    label: "Type",
                    get options() {
                      return queryTypeOptions;
                    },
                    multiple: false,
                    searchable: false,
                    clearable: false,
                    get value() {
                      return get(queryType);
                    },
                    set value($$value) {
                      set(queryType, $$value, true);
                    }
                  });
                  var node_7 = sibling(node_6, 2);
                  {
                    var consequent_1 = ($$anchor6) => {
                      AdvancedSelect($$anchor6, {
                        id: "post-type",
                        label: "Post Type",
                        get options() {
                          return get(postTypeOptions);
                        },
                        multiple: false,
                        searchable: true,
                        clearable: false,
                        get value() {
                          return get(postType);
                        },
                        set value($$value) {
                          set(postType, $$value, true);
                        }
                      });
                    };
                    var alternate = ($$anchor6) => {
                      AdvancedSelect($$anchor6, {
                        id: "taxonomy",
                        label: "Taxonomy",
                        get options() {
                          return get(taxonomyOptions);
                        },
                        multiple: false,
                        searchable: true,
                        clearable: false,
                        get value() {
                          return get(taxonomy);
                        },
                        set value($$value) {
                          set(taxonomy, $$value, true);
                        }
                      });
                    };
                    if_block(node_7, ($$render) => {
                      if (get(queryType) === "post") $$render(consequent_1);
                      else $$render(alternate, false);
                    });
                  }
                  append($$anchor5, div_2);
                },
                $$slots: { default: true }
              });
              var node_8 = sibling(node_5, 2);
              Card(node_8, {
                title: "Query Parameters",
                children: ($$anchor5, $$slotProps2) => {
                  var fragment_9 = root_10();
                  var div_3 = first_child(fragment_9);
                  var node_9 = child(div_3);
                  AdvancedSelect(node_9, {
                    id: "order-by",
                    label: "Order By",
                    get options() {
                      return orderByOptions;
                    },
                    multiple: false,
                    searchable: false,
                    clearable: false,
                    get value() {
                      return get(orderBy);
                    },
                    set value($$value) {
                      set(orderBy, $$value, true);
                    }
                  });
                  var node_10 = sibling(node_9, 2);
                  AdvancedSelect(node_10, {
                    id: "order",
                    label: "Order",
                    get options() {
                      return orderOptions;
                    },
                    multiple: false,
                    searchable: false,
                    clearable: false,
                    get value() {
                      return get(order);
                    },
                    set value($$value) {
                      set(order, $$value, true);
                    }
                  });
                  var node_11 = sibling(node_10, 2);
                  NumberInput(node_11, {
                    id: "post-count",
                    label: "Post Count",
                    help: "Use -1 for unlimited",
                    get value() {
                      return get(postCount);
                    },
                    set value($$value) {
                      set(postCount, $$value, true);
                    }
                  });
                  var node_12 = sibling(node_11, 2);
                  NumberInput(node_12, {
                    id: "child-of",
                    label: "Child Of",
                    help: "Show only children of this ID",
                    get value() {
                      return get(childOf);
                    },
                    set value($$value) {
                      set(childOf, $$value, true);
                    }
                  });
                  var node_13 = sibling(div_3, 2);
                  {
                    var consequent_2 = ($$anchor6) => {
                      var div_4 = root_11();
                      var node_14 = child(div_4);
                      Switch(node_14, {
                        id: "include-parent-item",
                        label: "Include This ID",
                        help: "When enabled, includes the parent item (Child Of ID) as the first menu item, with query results as sub-menu items",
                        get checked() {
                          return get(includeParentItem);
                        },
                        set checked($$value) {
                          set(includeParentItem, $$value, true);
                        }
                      });
                      append($$anchor6, div_4);
                    };
                    if_block(node_13, ($$render) => {
                      if (get(childOf) > 0) $$render(consequent_2);
                    });
                  }
                  var div_5 = sibling(node_13, 2);
                  var node_15 = child(div_5);
                  Switch(node_15, {
                    id: "include-children",
                    label: "Include Children",
                    get checked() {
                      return get(includeChildren);
                    },
                    set checked($$value) {
                      set(includeChildren, $$value, true);
                    }
                  });
                  var node_16 = sibling(node_15, 2);
                  Switch(node_16, {
                    id: "hierarchical",
                    label: "Hierarchical Results",
                    help: "When checked, results are nested by parent/child relationships",
                    get checked() {
                      return get(hierarchical);
                    },
                    set checked($$value) {
                      set(hierarchical, $$value, true);
                    }
                  });
                  append($$anchor5, fragment_9);
                },
                $$slots: { default: true }
              });
              var node_17 = sibling(node_8, 2);
              {
                var consequent_3 = ($$anchor5) => {
                  var fragment_10 = root_12();
                  var node_18 = first_child(fragment_10);
                  Card(node_18, {
                    title: "Include / Exclude Posts",
                    children: ($$anchor6, $$slotProps2) => {
                      var div_6 = root_13();
                      var node_19 = child(div_6);
                      MultiSelect(node_19, {
                        id: "include-posts",
                        label: "Include Posts",
                        get options() {
                          return get(postOptions);
                        },
                        placeholder: "Search posts...",
                        get value() {
                          return get(includePosts);
                        },
                        set value($$value) {
                          set(includePosts, $$value, true);
                        }
                      });
                      var node_20 = sibling(node_19, 2);
                      MultiSelect(node_20, {
                        id: "exclude-posts",
                        label: "Exclude Posts",
                        get options() {
                          return get(postOptions);
                        },
                        placeholder: "Search posts...",
                        get value() {
                          return get(excludePosts);
                        },
                        set value($$value) {
                          set(excludePosts, $$value, true);
                        }
                      });
                      append($$anchor6, div_6);
                    },
                    $$slots: { default: true }
                  });
                  var node_21 = sibling(node_18, 2);
                  Card(node_21, {
                    title: "Include / Exclude Taxonomies",
                    children: ($$anchor6, $$slotProps2) => {
                      var fragment_11 = root_14();
                      var div_7 = sibling(first_child(fragment_11), 2);
                      var node_22 = child(div_7);
                      MultiSelect(node_22, {
                        id: "include-taxonomies",
                        label: "Include Taxonomies",
                        get options() {
                          return get(termOptions);
                        },
                        placeholder: "Search terms...",
                        get value() {
                          return get(includeTaxonomies);
                        },
                        set value($$value) {
                          set(includeTaxonomies, $$value, true);
                        }
                      });
                      var node_23 = sibling(node_22, 2);
                      MultiSelect(node_23, {
                        id: "exclude-taxonomies",
                        label: "Exclude Taxonomies",
                        get options() {
                          return get(termOptions);
                        },
                        placeholder: "Search terms...",
                        get value() {
                          return get(excludeTaxonomies);
                        },
                        set value($$value) {
                          set(excludeTaxonomies, $$value, true);
                        }
                      });
                      append($$anchor6, fragment_11);
                    },
                    $$slots: { default: true }
                  });
                  var node_24 = sibling(node_21, 2);
                  Card(node_24, {
                    children: ($$anchor6, $$slotProps2) => {
                      MetaQueryRepeater($$anchor6, {
                        onUpdate: handleMetaQueriesUpdate,
                        get metaQueries() {
                          return get(metaQueries);
                        },
                        set metaQueries($$value) {
                          set(metaQueries, $$value, true);
                        },
                        get relation() {
                          return get(metaQueryRelation);
                        },
                        set relation($$value) {
                          set(metaQueryRelation, $$value, true);
                        }
                      });
                    },
                    $$slots: { default: true }
                  });
                  append($$anchor5, fragment_10);
                };
                var alternate_1 = ($$anchor5) => {
                  Card($$anchor5, {
                    title: "Include / Exclude Terms",
                    children: ($$anchor6, $$slotProps2) => {
                      var div_8 = root_17();
                      var node_25 = child(div_8);
                      MultiSelect(node_25, {
                        id: "include-terms",
                        label: "Include Terms",
                        get options() {
                          return get(termOptions);
                        },
                        placeholder: "Search terms...",
                        get value() {
                          return get(includeTerms);
                        },
                        set value($$value) {
                          set(includeTerms, $$value, true);
                        }
                      });
                      var node_26 = sibling(node_25, 2);
                      MultiSelect(node_26, {
                        id: "exclude-terms",
                        label: "Exclude Terms",
                        get options() {
                          return get(termOptions);
                        },
                        placeholder: "Search terms...",
                        get value() {
                          return get(excludeTerms);
                        },
                        set value($$value) {
                          set(excludeTerms, $$value, true);
                        }
                      });
                      append($$anchor6, div_8);
                    },
                    $$slots: { default: true }
                  });
                };
                if_block(node_17, ($$render) => {
                  if (get(queryType) === "post") $$render(consequent_3);
                  else $$render(alternate_1, false);
                });
              }
              append($$anchor4, fragment_3);
            },
            $$slots: { default: true }
          });
        };
        var alternate_6 = ($$anchor3) => {
          var fragment_14 = comment();
          var node_27 = first_child(fragment_14);
          {
            var consequent_5 = ($$anchor4) => {
              Stack($$anchor4, {
                children: ($$anchor5, $$slotProps) => {
                  Card($$anchor5, {
                    title: "Raw WP_Query",
                    children: ($$anchor6, $$slotProps2) => {
                      var fragment_17 = root_21();
                      var node_28 = sibling(first_child(fragment_17), 2);
                      Textarea(node_28, {
                        id: "raw-wp-query",
                        rows: 20,
                        placeholder: "Click 'Build Query' in the Builder tab to generate...",
                        get value() {
                          return get(rawWPQuery);
                        },
                        set value($$value) {
                          set(rawWPQuery, $$value, true);
                        }
                      });
                      append($$anchor6, fragment_17);
                    },
                    $$slots: { default: true }
                  });
                },
                $$slots: { default: true }
              });
            };
            var alternate_5 = ($$anchor4) => {
              Stack($$anchor4, {
                children: ($$anchor5, $$slotProps) => {
                  Card($$anchor5, {
                    title: "Query Results",
                    children: ($$anchor6, $$slotProps2) => {
                      var fragment_20 = comment();
                      var node_29 = first_child(fragment_20);
                      {
                        var consequent_6 = ($$anchor7) => {
                          var p = root_25();
                          append($$anchor7, p);
                        };
                        var alternate_4 = ($$anchor7) => {
                          var fragment_21 = comment();
                          var node_30 = first_child(fragment_21);
                          {
                            var consequent_7 = ($$anchor8) => {
                              var p_1 = root_27();
                              var text2 = child(p_1);
                              template_effect(() => set_text(text2, get(resultsError)));
                              append($$anchor8, p_1);
                            };
                            var alternate_3 = ($$anchor8) => {
                              var fragment_22 = comment();
                              var node_31 = first_child(fragment_22);
                              {
                                var consequent_8 = ($$anchor9) => {
                                  Textarea($$anchor9, {
                                    id: "query-results",
                                    get value() {
                                      return get(queryResults);
                                    },
                                    rows: 20,
                                    readonly: true
                                  });
                                };
                                var alternate_2 = ($$anchor9) => {
                                  var p_2 = root_30();
                                  append($$anchor9, p_2);
                                };
                                if_block(
                                  node_31,
                                  ($$render) => {
                                    if (get(queryResults)) $$render(consequent_8);
                                    else $$render(alternate_2, false);
                                  },
                                  true
                                );
                              }
                              append($$anchor8, fragment_22);
                            };
                            if_block(
                              node_30,
                              ($$render) => {
                                if (get(resultsError)) $$render(consequent_7);
                                else $$render(alternate_3, false);
                              },
                              true
                            );
                          }
                          append($$anchor7, fragment_21);
                        };
                        if_block(node_29, ($$render) => {
                          if (get(isLoadingResults)) $$render(consequent_6);
                          else $$render(alternate_4, false);
                        });
                      }
                      append($$anchor6, fragment_20);
                    },
                    $$slots: { default: true }
                  });
                },
                $$slots: { default: true }
              });
            };
            if_block(
              node_27,
              ($$render) => {
                if (get(activeTab) === "query") $$render(consequent_5);
                else $$render(alternate_5, false);
              },
              true
            );
          }
          append($$anchor3, fragment_14);
        };
        if_block(node, ($$render) => {
          if (get(activeTab) === "builder") $$render(consequent_4);
          else $$render(alternate_6, false);
        });
      }
      template_effect(() => {
        set_attribute(button, "aria-selected", get(activeTab) === "builder");
        set_attribute(button_1, "aria-selected", get(activeTab) === "query");
        set_attribute(button_2, "aria-selected", get(activeTab) === "results");
      });
      append($$anchor2, fragment_1);
    };
    const footer = ($$anchor2) => {
      var div_9 = root_31();
      var div_10 = child(div_9);
      var node_32 = child(div_10);
      {
        let $0 = /* @__PURE__ */ user_derived(() => get(showResetConfirm) ? "danger" : "ghost");
        Button(node_32, {
          get variant() {
            return get($0);
          },
          onclick: handleReset,
          children: ($$anchor3, $$slotProps) => {
            var text_1 = text();
            template_effect(() => set_text(text_1, get(showResetConfirm) ? "Confirm Reset?" : "Reset"));
            append($$anchor3, text_1);
          },
          $$slots: { default: true }
        });
      }
      var div_11 = sibling(div_10, 2);
      var node_33 = child(div_11);
      Button(node_33, {
        variant: "ghost",
        get onclick() {
          return $$props.onClose;
        },
        children: ($$anchor3, $$slotProps) => {
          var text_2 = text("Cancel");
          append($$anchor3, text_2);
        },
        $$slots: { default: true }
      });
      var node_34 = sibling(node_33, 2);
      {
        var consequent_9 = ($$anchor3) => {
          Button($$anchor3, {
            variant: "primary",
            onclick: handleSubmit,
            children: ($$anchor4, $$slotProps) => {
              var text_3 = text("Save Query");
              append($$anchor4, text_3);
            },
            $$slots: { default: true }
          });
        };
        if_block(node_34, ($$render) => {
          if (get(canSave)) $$render(consequent_9);
        });
      }
      append($$anchor2, div_9);
    };
    Modal($$anchor, {
      size: "large",
      title: "Query Builder",
      get open() {
        return open();
      },
      set open($$value) {
        open($$value);
      },
      children,
      footer,
      $$slots: { default: true, footer: true }
    });
  }
  pop();
}
delegate(["click"]);
function MenuQueriesApp($$anchor, $$props) {
  push($$props, true);
  let modalOpen = /* @__PURE__ */ state(false);
  let initialConfig = /* @__PURE__ */ state(null);
  user_effect(() => {
    const handleOpen = (e) => {
      const { rawWPQuery, config } = e.detail || {};
      if (rawWPQuery) {
        set(initialConfig, { rawWPQuery }, true);
      } else {
        set(initialConfig, config || null, true);
      }
      set(modalOpen, true);
    };
    document.addEventListener("menu-queries:open", handleOpen);
    return () => {
      document.removeEventListener("menu-queries:open", handleOpen);
    };
  });
  function handleClose() {
    set(modalOpen, false);
  }
  function handleSubmit(config) {
    $$props.onSubmit(config);
  }
  QueryBuilderModal($$anchor, {
    get initialConfig() {
      return get(initialConfig);
    },
    onClose: handleClose,
    onSubmit: handleSubmit,
    get open() {
      return get(modalOpen);
    },
    set open($$value) {
      set(modalOpen, $$value, true);
    }
  });
  pop();
}
let currentMenuItemId = null;
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
function init() {
  const isCustomizer = window.location.pathname.includes("customize.php") || window.location.search.includes("customize_theme");
  if (isCustomizer) {
    initializeCustomizer();
    return;
  }
  const container = document.getElementById("menu-queries-app");
  const addButton = document.getElementById("add-query-item");
  if (!container) {
    return;
  }
  mount(MenuQueriesApp, {
    target: document.body,
    props: {
      onSubmit: (config) => {
        saveQueryConfig(config);
      }
    }
  });
  if (addButton) {
    addButton.addEventListener("click", handleAddQueryItem);
  }
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("configure-query-button")) {
      const itemId = parseInt(target.getAttribute("data-item-id") || "0", 10);
      if (itemId) {
        openQueryBuilderForItem(itemId);
      }
    }
  });
}
function initializeCustomizer() {
  mount(MenuQueriesApp, {
    target: document.body,
    props: {
      onSubmit: (config) => {
        saveQueryConfigCustomizer(config);
      }
    }
  });
  if (typeof window.wp === "undefined" || typeof window.wp.customize === "undefined") {
    setTimeout(initializeCustomizer, 500);
    return;
  }
  const customize = window.wp.customize;
  customize.bind("ready", () => {
    customize.control.each((control) => {
      if (control.params && control.params.type === "nav_menu_item") {
        addConfigureButtonToControl(control);
      }
    });
    customize.control.bind("add", (control) => {
      if (control.params && control.params.type === "nav_menu_item") {
        addConfigureButtonToControl(control);
        const value = control.setting ? control.setting() : null;
        if (value && value.type === "query_item") {
          setTimeout(() => {
            const container = control.container[0];
            if (container && container.classList.contains("menu-item-edit-active")) {
              const itemId = control.id.replace("nav_menu_item[", "").replace("]", "");
              openQueryBuilderForItemCustomizer(parseInt(itemId, 10));
            }
          }, 500);
        }
      }
    });
  });
}
function addConfigureButtonToControl(control) {
  if (typeof control.setting !== "function") {
    return;
  }
  const value = control.setting();
  if (!value) {
    return;
  }
  const itemId = control.id.replace("nav_menu_item[", "").replace("]", "");
  const isQueryItem = value.query_config || value.type === "query_item" || value.type === "custom" && value.object === "custom" && value.url === "#query-item";
  if (!isQueryItem) {
    return;
  }
  const container = control.container[0];
  if (!container) {
    return;
  }
  const observer = new MutationObserver((mutations) => {
    if (container.querySelector(".configure-query-button-customizer")) {
      return;
    }
    if (!container.classList.contains("menu-item-edit-active")) {
      return;
    }
    const itemControls = container.querySelector(".menu-item-settings");
    if (!itemControls) {
      return;
    }
    const buttonContainer = document.createElement("p");
    buttonContainer.className = "field-query-config description description-wide";
    buttonContainer.style.marginTop = "10px";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button button-secondary configure-query-button-customizer";
    button.setAttribute("data-item-id", itemId);
    button.textContent = value.query_config ? "Edit Query" : "Configure Query";
    button.addEventListener("click", (e) => {
      e.preventDefault();
      openQueryBuilderForItemCustomizer(parseInt(itemId, 10));
    });
    buttonContainer.appendChild(button);
    const urlField = itemControls.querySelector(".field-url");
    if (urlField && urlField.parentNode) {
      urlField.parentNode.insertBefore(buttonContainer, urlField.nextSibling);
    } else {
      itemControls.appendChild(buttonContainer);
    }
  });
  observer.observe(container, {
    childList: true,
    subtree: true,
    attributes: true,
    // Watch for class changes (menu-item-edit-active)
    attributeFilter: ["class"]
    // Only watch class attribute
  });
}
async function openQueryBuilderForItemCustomizer(itemId) {
  currentMenuItemId = itemId;
  const customize = window.wp.customize;
  const setting = customize("nav_menu_item[" + itemId + "]");
  if (!setting) {
    return;
  }
  const value = setting();
  let rawWPQuery = "";
  if (value && value.query_config) {
    rawWPQuery = value.query_config.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  } else {
    try {
      const response = await fetch(`${window.abMenuQueriesData.apiUrl}/menu-queries/get-config?menu_item_id=${itemId}`, {
        headers: {
          "X-WP-Nonce": window.abMenuQueriesData.nonce
        }
      });
      const data = await response.json();
      if (data.success && data.query_config) {
        rawWPQuery = data.query_config;
      }
    } catch (error) {
      console.error("Failed to load query config from database:", error);
    }
  }
  document.dispatchEvent(new CustomEvent("menu-queries:open", {
    detail: { itemId, rawWPQuery }
  }));
}
async function saveQueryConfigCustomizer(config) {
  if (!currentMenuItemId) {
    return;
  }
  const customize = window.wp.customize;
  const setting = customize("nav_menu_item[" + currentMenuItemId + "]");
  const queryToSave = config.rawWPQuery || "";
  const isTempId = currentMenuItemId < 0;
  if (setting) {
    const currentValue = setting();
    let title = currentValue.title || "Query Item";
    if (title === "Query Item" || !title) {
      try {
        const parsed = JSON.parse(queryToSave);
        const postType = parsed.post_type || "";
        const taxonomy = parsed.taxonomy || "";
        const newTitle = taxonomy ? `Query: ${taxonomy}` : `Query: ${postType}`;
        if (newTitle && newTitle !== "Query: ") {
          title = newTitle;
        }
      } catch (e) {
      }
    }
    const encodedConfig = btoa(queryToSave);
    const newValue = {
      ...currentValue,
      query_config: queryToSave,
      // Will be stripped by sanitization, but needed for preview
      description: encodedConfig,
      // Survives sanitization!
      title
    };
    setting.set(newValue);
  }
  if (!isTempId) {
    try {
      const response = await fetch(`${window.abMenuQueriesData.apiUrl}/menu-queries/save-config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": window.abMenuQueriesData.nonce
        },
        body: JSON.stringify({
          menu_item_id: currentMenuItemId,
          query_config: queryToSave
        })
      });
      const data = await response.json();
      if (!data.success) {
        console.error("Failed to save query config to database:", data);
      }
    } catch (error) {
      console.error("Error saving query config to database:", error);
    }
  }
  setTimeout(() => {
    customize.previewer.refresh();
  }, 100);
  currentMenuItemId = null;
}
function handleAddQueryItem(e) {
  e.preventDefault();
  const { ajaxUrl, ajaxNonce } = window.abMenuQueriesData;
  const menuId = getSelectedMenuId();
  if (!menuId) {
    alert("Please select a menu first.");
    return;
  }
  const button = e.target;
  const spinner = button.parentElement?.querySelector(".spinner");
  if (spinner) {
    spinner.classList.add("is-active");
  }
  button.disabled = true;
  const formData = new FormData();
  formData.append("action", "add_query_menu_item");
  formData.append("nonce", ajaxNonce);
  formData.append("menu", menuId.toString());
  formData.append("title", "Query Item");
  fetch(ajaxUrl, {
    method: "POST",
    body: formData
  }).then((response) => response.json()).then((data) => {
    if (data.success && data.data?.menu_item_html) {
      addMenuItemToDOM(data.data.menu_item_html);
    } else {
      alert(data.data?.message || "Error adding query item");
    }
  }).catch((error) => {
    console.error("Error adding query item:", error);
    alert("Error adding query item. Please try again.");
  }).finally(() => {
    if (spinner) {
      spinner.classList.remove("is-active");
    }
    button.disabled = false;
  });
}
function addMenuItemToDOM(html) {
  const menuList = document.getElementById("menu-to-edit");
  if (!menuList) {
    return;
  }
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const menuItem = temp.firstElementChild;
  if (menuItem) {
    menuList.appendChild(menuItem);
    if (typeof window.wpNavMenu !== "undefined") {
      window.wpNavMenu.refreshKeyboardAccessibility();
      window.wpNavMenu.refreshAdvancedAccessibility();
    }
  }
}
function openQueryBuilderForItem(itemId) {
  currentMenuItemId = itemId;
  const configInput = document.getElementById(`query-config-${itemId}`);
  let rawWPQuery = "";
  if (configInput && configInput.value) {
    try {
      let configValue = configInput.value;
      let parsed = null;
      try {
        parsed = JSON.parse(configValue);
      } catch (firstError) {
        try {
          const textarea = document.createElement("textarea");
          textarea.innerHTML = configValue;
          configValue = textarea.value;
          parsed = JSON.parse(configValue);
        } catch (secondError) {
          configValue = configInput.value.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
          parsed = JSON.parse(configValue);
        }
      }
      if (parsed && (parsed.post_type || parsed.taxonomy)) {
        rawWPQuery = JSON.stringify(parsed);
      } else if (parsed && parsed.rawWPQuery) {
        rawWPQuery = parsed.rawWPQuery;
      }
    } catch (e) {
    }
  }
  document.dispatchEvent(new CustomEvent("menu-queries:open", {
    detail: { itemId, rawWPQuery }
  }));
}
function saveQueryConfig(config) {
  if (!currentMenuItemId) {
    return;
  }
  const queryToSave = config.rawWPQuery || "";
  const configInput = document.getElementById(`query-config-${currentMenuItemId}`);
  if (configInput) {
    configInput.value = queryToSave;
    const event2 = new Event("change", { bubbles: true });
    configInput.dispatchEvent(event2);
  }
  currentMenuItemId = null;
}
function getSelectedMenuId() {
  const selectElement = document.getElementById("menu");
  if (selectElement && selectElement.value) {
    return parseInt(selectElement.value, 10);
  }
  return null;
}
