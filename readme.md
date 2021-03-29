# covid-img

Data visualization with the COVID-19 vaccines. Sequences of the vaccines come from [this repo](https://github.com/NAalytics/Assemblies-of-putative-SARS-CoV2-spike-encoding-mRNA-sequences-for-vaccines-BNT-162b2-and-mRNA-1273
). View it live [here](https://covid-vaccine-viz.vercel.app/).

This only has a "barcode" visualizer right now, but I'll add some more over time. I also tossed a few designs [on Redbubble](https://www.redbubble.com/people/connor4312/shop) if you'd like some prints. Of course, you're free to build your own with the tool and print them however you'd like :)

## Development Setup

1. `yarn install`
1. `yarn watch`
1. Serve out of the repo folder with your favorite server, like [`serve`](https://github.com/vercel/serve)

I also have a useful script in `data/toImage.js` that captures high res images, useful for printing.
