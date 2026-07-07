from unittest.mock import MagicMock, patch

from talk_to_your_video.graph.video_status import (
    create_video,
    get_video_status,
    set_video_status,
)
from talk_to_your_video.models import VideoStatus


def test_create_video_sets_queued_status_and_title():
    fake_driver = MagicMock()
    fake_session = MagicMock()
    fake_driver.session.return_value.__enter__.return_value = fake_session

    with patch("talk_to_your_video.graph.video_status.get_driver", return_value=fake_driver):
        create_video("video-1", title="My Video")

    fn = fake_session.execute_write.call_args.args[0]
    fake_tx = MagicMock()
    fn(fake_tx)
    _, kwargs = fake_tx.run.call_args
    assert kwargs["video_id"] == "video-1"
    assert kwargs["status"] == VideoStatus.QUEUED.value
    assert kwargs["title"] == "My Video"


def test_set_video_status_updates_status():
    fake_driver = MagicMock()
    fake_session = MagicMock()
    fake_driver.session.return_value.__enter__.return_value = fake_session

    with patch("talk_to_your_video.graph.video_status.get_driver", return_value=fake_driver):
        set_video_status("video-1", VideoStatus.COMPLETE)

    fn = fake_session.execute_write.call_args.args[0]
    fake_tx = MagicMock()
    fn(fake_tx)
    _, kwargs = fake_tx.run.call_args
    assert kwargs["video_id"] == "video-1"
    assert kwargs["status"] == VideoStatus.COMPLETE.value


def test_get_video_status_returns_status_when_found():
    fake_driver = MagicMock()
    fake_session = MagicMock()
    fake_driver.session.return_value.__enter__.return_value = fake_session
    fake_session.execute_read.return_value = {"status": "complete"}

    with patch("talk_to_your_video.graph.video_status.get_driver", return_value=fake_driver):
        result = get_video_status("video-1")

    assert result == VideoStatus.COMPLETE


def test_get_video_status_returns_none_when_not_found():
    fake_driver = MagicMock()
    fake_session = MagicMock()
    fake_driver.session.return_value.__enter__.return_value = fake_session
    fake_session.execute_read.return_value = None

    with patch("talk_to_your_video.graph.video_status.get_driver", return_value=fake_driver):
        result = get_video_status("video-1")

    assert result is None
