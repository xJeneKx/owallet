import { Text, Icon } from '@ui-kitten/components';
import React, { useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import colors from '../../../colors';

const SLIDER_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.9);
const sliderData = [{ title: 'Very security wallet' }, { title: 'Very easy payments' }];


const StartCarousel = (props) => {
  const [carousel, setCarousel] = useState();
  const [activeSlide, setActiveSlide] = useState(0);

  const Logo = (props) => {
    switch (props.index) {
      case 0:
        return <Icon name={'shield-checkmark-outline'} style={styles.logo}/>
      case 1:
        return <Icon name={'send-outline'} style={styles.logo}/>
      default:
        return null;
    }
  }

  const renderItem = ({ item, index }) => (
    <View style={styles.slide}>
      <Logo index={index}/>
      <Text style={styles.slideTitle}>{item.title}</Text>
    </View>
  )

  const MyPagination = () => {
    return (
      <Pagination
        dotsLength={sliderData.length}
        activeDotIndex={activeSlide}
        dotStyle={{
          width: 12,
          height: 12,
          borderRadius: 5,
          marginHorizontal: 8,
          backgroundColor: '#C4C4C4'
        }}
        inactiveDotStyle={{
          // Define styles for inactive dots here
        }}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.8}
        carouselRef={carousel}
        tappableDots={true}
      />
    );
  }

  return (
    <View style={props.style}>
      <Carousel
        ref={(c) => {
          setCarousel(c);
        }}
        data={sliderData}
        renderItem={renderItem}
        sliderWidth={SLIDER_WIDTH}
        itemWidth={ITEM_WIDTH}
        onSnapToItem={(index) => {
          setActiveSlide(index);
          if (index === 2) setTimeout(() => carousel.snapToItem(0), 3000);
        }}
        autoplay={true}
        lockScrollWhileSnapping={true}
        autoplayDelay={3000}
      />
      {carousel ? <MyPagination/> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.text
  },
  logo: { marginBottom: 72, width: 92, height: 92, color: colors.blue }
});

export default StartCarousel;