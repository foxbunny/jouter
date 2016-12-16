Thank you for showing interest in Jouter. Your time and effort is much
appreciated. Before you submit a pull request, please make sure your patches
are in line with Jouter's development goals.

# Test coverage

Please make sure tests are passing and cover all testable code. By testabe code
we mean any code that does not touch HTML APIs on the global object. 

# It's a client-side routing library

Server-side features can only be added as a bonus. Patches that degrade the
experience on the client-side will not be a good fit for Jouter, even if it
makes life easier on the server-side.

# Backwards compatibility

Jouter takes semantic versioning seriously. Changes that are
backwards-incompatible will need to wait until the next major release which can
take a while.

# Keep it around 1KB

Jouter is supposed to be light. As in *really* light. 1KB is an arbitrary
number, for sure, but the idea is to keep it small. If your patch is going to
double the library's size, you may be looking for a plugin system or something
along those lines.

# Keep it sealed

For the most part Jouter's user should not need to think about how Jouter works
internally. Changes to the API that would introduce this kind of cognitive
overhead are not a good fit for Jouter.

# No fancy DSL for describing routes

Each of the three placeholder sequences are carefully picked to cover some of
the more common real-life use cases, and regex is offered for everything else.
Unless there is a very good reason, new language for defining routes will not
be added.
