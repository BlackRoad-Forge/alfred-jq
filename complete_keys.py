#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# vim:fenc=utf-8

"""Alfred workflow script for jq key autocompletion.

Reads JSON from clipboard, extracts available keys for the current jq query,
and presents them as Alfred autocomplete suggestions.
"""

import sys
from workflow import Workflow


def build_full_query(query, key):
    """Build a full jq query by appending a key to the current query.

    Args:
        query: Current jq query string.
        key: Key to append.

    Returns:
        Full jq query string with the key appended.
    """
    if query[-1] != '.':
        return query + '.' + key
    return query + key


def main(wf):
    """Main workflow entry point.

    Args:
        wf: Alfred Workflow instance.

    Returns:
        Exit code (0 for success).
    """
    queries = wf.args
    q = queries[0].strip()
    error_code = queries[-1]
    if error_code != '0':
        wf.add_item('Invalid JSON String in clipboard.',
                    valid=False,
                    icon='error.png')
        wf.send_feedback()
        return 0

    keys = queries[1:-1]
    for k in keys:
        full_q = build_full_query(q, k)
        wf.add_item(k,
                    arg=full_q,
                    autocomplete=full_q,
                    valid=True,
                    icon='icon.png')
    wf.send_feedback()
    return 0


if __name__ == '__main__':
    wf = Workflow()
    log = wf.logger
    sys.exit(wf.run(main))
