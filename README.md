# Cozy-sinopia

It starts a sinopia instance, a private npm server, 
and provides a terrile web front end to enable / disable it from NPM global config.

At startup it will set the global config.

At end it will reset the original registry.

So, no worry !

In case it breaks your registry config, reset it with

```
npm config set registry https://registry.npmjs.org/
```

# Cozy

It s cozy because it s cozy-light compatible. Find out more at https://github.com/cozy-labs/cozy-light.

# Sinopia

A private npm server useful to faster npm, Find out more at https://github.com/rlidwka/sinopia