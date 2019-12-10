import React from 'react';

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';

import 'react-accessible-accordion/dist/fancy-example.css';
import ReactSlider from "react-slider";

export default function Equalizer({
                                    onHighShelfChange,
                                    onHighShelfGain,
                                    onHighPassChange,
                                    onLowShelfGain,
                                    onLowShelfChange,
                                    onHighPassQ,
                                    onLowPassChange,
                                    onLowPassQ
                                  }) {

  // let isOpened = false;

  // function toggleAccordion() {
  //   isOpened ? '';
  // }


  return (
    <Accordion allowZeroExpanded>
      <AccordionItem>
        <AccordionItemHeading>
          <AccordionItemButton>
            Try to mix
          </AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <div className="d-flex space-between">
            <div className="d-flex">
              <ReactSlider
                className="vertical-slider"
                thumbClassName="vertical-slider-thumb"
                trackClassName="vertical-slider-track"
                orientation="vertical"
                onChange={onHighShelfChange}
                max={24000}
                invert
              /><ReactSlider
              className="vertical-slider"
              thumbClassName="vertical-slider-thumb"
              trackClassName="vertical-slider-track"
              orientation="vertical"
              onChange={onHighShelfGain}
              min={-50}
              max={50}
              invert
            />
            </div>
            <div className="d-flex">
              <ReactSlider
                className="vertical-slider"
                thumbClassName="vertical-slider-thumb"
                trackClassName="vertical-slider-track"
                orientation="vertical"
                onChange={onHighPassChange}
                max={24000}
                invert
              />
              <ReactSlider
                className="vertical-slider"
                thumbClassName="vertical-slider-thumb"
                trackClassName="vertical-slider-track"
                orientation="vertical"
                onChange={onLowShelfGain}
                min={-50}
                max={50}
                invert
              />
            </div>
            <div className="d-flex">
              <ReactSlider
                className="vertical-slider"
                thumbClassName="vertical-slider-thumb"
                trackClassName="vertical-slider-track"
                orientation="vertical"
                onChange={onLowShelfChange}
                max={24000}
                invert
              />
              <ReactSlider
                className="vertical-slider"
                thumbClassName="vertical-slider-thumb"
                trackClassName="vertical-slider-track"
                orientation="vertical"
                onChange={onHighPassQ}
                min={0.7}
                max={12}
                step={0.1}
                invert
              />
            </div>
            <div className="d-flex">
              <ReactSlider
                className="vertical-slider"
                thumbClassName="vertical-slider-thumb"
                trackClassName="vertical-slider-track"
                orientation="vertical"
                onChange={onLowPassChange}
                max={24000}
                invert
              />
              <ReactSlider
                className="vertical-slider"
                thumbClassName="vertical-slider-thumb"
                trackClassName="vertical-slider-track"
                orientation="vertical"
                onChange={onLowPassQ}
                min={0.7}
                max={12}
                step={0.1}
                invert
              />
            </div>
          </div>
        </AccordionItemPanel>
      </AccordionItem>
    </Accordion>
  );
}

