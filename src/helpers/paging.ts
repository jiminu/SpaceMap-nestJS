const getStartAndEnd = (page, total, display) => {
  const middle = Math.floor(display / 2);

  let start = 1,
    end = total;

  if (total <= display) {
    start = 1;
    end = total;
  } else {
    if (page - middle < 1) {
      start = 1;
    } else {
      if (page + middle >= total) {
        start = total - display + 1;
      } else {
        start = page - middle;
      }
    }

    if (page + middle <= total) {
      if (page + middle < display) {
        end = display;
      } else {
        end = page + middle;
      }
    }
  }

  return {
    start: --start,
    end: end,
  };
};

export default getStartAndEnd;
