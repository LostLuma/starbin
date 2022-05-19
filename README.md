# Starbin

A hastebin-compatible paste site running on Cloudflare Workers.

# Deployment

To deploy as a pages project you will need to set up the following:

KV namespace bindings:

- ``STORAGE``: A KV namespace to store pastes in

Environment variables:

- ``DOCUMENT_KEY_SIZE``: Number of digits to use for document URLs
- ``MAX_DOCUMENT_SIZE``: Maximum number of characters allowed per paste
- ``DOCUMENT_EXPIRE_TTL``: Number of seconds until documents expire

# TODO

I did not invest any time into creating my own frontend yet, all static
assets are copied from the original [haste-server](https://github.com/seejohnrun/haste-server).
