# Q
A lightweight promise based queue.

```typescript
const queue = new Q<string>() 
// You can also pass a timeout, it defaults to 10s.

queue.offer("Hello")
    .then(queueLength => f(queueLength))

queue.take()
    .then(str => g(str))
```