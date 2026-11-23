
GAP = 1000.0
MIN_GAP=0.001

def calculate_position(prev:float | None, next:float | None)->float|None:
    if prev is None and next is None:
        return GAP
    if prev is None and next is not None:
        return next - GAP
    if prev is not None and next is None:
        return prev + GAP
    if prev is not None and next is not None:
        if next - prev >= MIN_GAP:
            return (prev+next) / 2
        return None

def rebalance_positions(items):
    for i, item in enumerate(items):
        item.position = GAP * (i + 1)
