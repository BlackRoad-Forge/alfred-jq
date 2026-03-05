"""Tests to validate the Alfred workflow structure."""

import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class TestWorkflowStructure:
    """Validate that all required workflow files exist."""

    def test_info_plist_exists(self):
        assert os.path.isfile(os.path.join(ROOT_DIR, 'info.plist'))

    def test_complete_keys_exists(self):
        assert os.path.isfile(os.path.join(ROOT_DIR, 'complete_keys.py'))

    def test_workflow_module_exists(self):
        assert os.path.isdir(os.path.join(ROOT_DIR, 'workflow'))
        assert os.path.isfile(os.path.join(ROOT_DIR, 'workflow', '__init__.py'))

    def test_icon_exists(self):
        assert os.path.isfile(os.path.join(ROOT_DIR, 'icon.png'))

    def test_error_icon_exists(self):
        assert os.path.isfile(os.path.join(ROOT_DIR, 'error.png'))

    def test_info_plist_valid_xml(self):
        """info.plist should be valid XML."""
        import xml.etree.ElementTree as ET
        plist_path = os.path.join(ROOT_DIR, 'info.plist')
        tree = ET.parse(plist_path)
        root = tree.getroot()
        assert root.tag == 'plist'

    def test_info_plist_has_bundle_id(self):
        """info.plist should contain a bundle ID."""
        import xml.etree.ElementTree as ET
        plist_path = os.path.join(ROOT_DIR, 'info.plist')
        with open(plist_path, 'r') as f:
            content = f.read()
        assert 'bundleid' in content

    def test_github_workflows_exist(self):
        """GitHub Actions workflows should exist."""
        workflows_dir = os.path.join(ROOT_DIR, '.github', 'workflows')
        assert os.path.isdir(workflows_dir)
        workflow_files = os.listdir(workflows_dir)
        assert len(workflow_files) >= 1
