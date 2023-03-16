import logging, inspect, os

def parse_color(color) -> tuple:
    """Parse a color string into a tuple of (r, g, b) values."""
    # first use case is from format 'rgb(r,g,b)' I'll try to stick to that
    if not isinstance(color, str):  # make sure it's a string
        raise ValueError(f'Invalid color format: {type(color)}')
    if not color.startswith('rgb('):  # check for rgb format
        raise ValueError(f'Invalid color format: {color}')
    # strip off the rgb() and split on commas, then convert to ints
    color = tuple(int(c.strip()) for c in color[4:-1].split(','))
    return color # return the tuple of ints

def get_trace():
    calling_frames = inspect.getouterframes(inspect.currentframe())[1:]
    names = []
    for frame_info in calling_frames:
        filename = os.path.basename(frame_info.filename).split('.')[0].replace('-', '_')
        if not filename.endswith('.py'):
            filename = filename.replace('.', '_')
        name = f'[{filename}]' if frame_info.function == '<module>' else f'[{filename}].{frame_info.function}'
        names.append(name)
    names.reverse()
    return '>'.join(names)


if __name__ == '__main__':
    pass