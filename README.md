# Starbin

A hastebin-compatible paste site running on Cloudflare Workers / Pages.

# Deployment

To deploy as a Pages project you will need to follow these steps:

- Fork this repo to an account where you can install GitHub Apps
- Create an empty KV namespace to store pastes in on the Workers dashboard
- Create a new Pages project using the Git integration and your forked repo
  - Set an empty ``echo`` command as the build command - no actual build is performed
  - Set the build output directory to ``/static/`` to allow Pages to find the website
- Under the project's settings in the Functions tab set up a new KV namespace binding
  - Set the variable name to ``STORAGE``, the namespace to the namespace from earlier
- Under the project's Environment Variables settings set up the following variables:
  - ``DOCUMENT_KEY_SIZE``: Number of digits to use for document URLs
  - ``MAX_DOCUMENT_SIZE``: Maximum number of characters allowed per paste
  - ``DOCUMENT_EXPIRE_TTL``: Number of seconds until documents expire

And that's it! You may now set a custom domain if you'd like the site to be available outside of workers.dev

# TODO

I did not invest any time into creating my own frontend yet, all static
assets are copied from the original [haste-server](https://github.com/seejohnrun/haste-server).
