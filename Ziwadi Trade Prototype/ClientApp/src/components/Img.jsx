import React from "react";
import PropTypes from "prop-types";
import Observer from "react-intersection-observer";

import styles from '../styles/Img.css';

export default function Img(props) {
  const { src, alt, width, height, ...rest } = props;

  return (
    <div className={styles.root} style={{ "--maxWidth": width }}>
      <Observer triggerOnce={true}>
        {({ inView, ref }) => (
          <div
            ref={ref}
            className={styles.wrapper}
            style={{
              "--height": height,
              "--width": width
            }}
          >
            <img
              src={inView ? src : ""}
              alt={alt}
              width={width}
              height={height}
              className={styles.img}
              {...rest}
            />
          </div>
        )}
      </Observer>
    </div>
  );
}

Img.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  src: PropTypes.string,
  alt: PropTypes.string
};