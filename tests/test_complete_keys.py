"""Tests for complete_keys.py jq query building logic.

Tests the build_full_query function in isolation. The vendored workflow
module has Python 2 dependencies, so we mock it before importing.
"""

import sys
import os
import types

# Mock the vendored workflow module (Python 2 only) before importing complete_keys
mock_workflow = types.ModuleType('workflow')
mock_workflow.Workflow = type('Workflow', (), {'run': lambda self, fn: fn(self), 'logger': None})
mock_workflow.ICON_WARNING = 'icon_warning.png'
sys.modules['workflow'] = mock_workflow

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from complete_keys import build_full_query


class TestBuildFullQuery:
    """Tests for the build_full_query function."""

    def test_append_key_with_dot(self):
        """When query ends with '.', key is appended directly."""
        assert build_full_query('.', 'name') == '.name'

    def test_append_key_without_dot(self):
        """When query does not end with '.', a dot is inserted."""
        assert build_full_query('.data', 'id') == '.data.id'

    def test_nested_query_with_dot(self):
        """Nested query ending with dot appends key directly."""
        assert build_full_query('.data.items.', 'count') == '.data.items.count'

    def test_nested_query_without_dot(self):
        """Nested query without trailing dot inserts separator."""
        assert build_full_query('.data.items', 'count') == '.data.items.count'

    def test_single_char_key(self):
        """Single character key is handled correctly."""
        assert build_full_query('.', 'x') == '.x'

    def test_key_with_underscore(self):
        """Keys with underscores are handled correctly."""
        assert build_full_query('.', 'user_name') == '.user_name'

    def test_key_with_numbers(self):
        """Keys with numbers are handled correctly."""
        assert build_full_query('.data', 'item2') == '.data.item2'


class TestQueryEdgeCases:
    """Edge case tests for query building."""

    def test_deeply_nested(self):
        """Deeply nested queries work correctly."""
        result = build_full_query('.a.b.c.d', 'e')
        assert result == '.a.b.c.d.e'

    def test_hyphenated_key(self):
        """Keys with hyphens are handled correctly."""
        assert build_full_query('.', 'content-type') == '.content-type'
